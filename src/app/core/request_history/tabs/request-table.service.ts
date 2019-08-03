import { AuthService } from './../../../services/auth.service';
import { MessageRequestService } from './../../../services/message-request.service';
import { MessageRequest } from './../../../models/message_request';
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from './sortable.directive';

interface SearchResult {
  requests: MessageRequest[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(requests: MessageRequest[], column: string, direction: string): MessageRequest[] {
  if (direction === '') {
    return requests;
  } else {
    return [...requests].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(request: MessageRequest, term: string, pipe: PipeTransform) {
  if (!request) {
    return false;
  } else {
    console.log("here is the request " + request);
    
    return request.createdAt.toLowerCase().includes(term.toLowerCase())
      || request.textContent.valueOf().toLowerCase().includes(term.toLowerCase())
      || request.requestStatus.toLowerCase().includes(term.toLowerCase())
      || pipe.transform(request.creditCost).includes(term);

  }
}

@Injectable({ providedIn: 'root' })
export class RequestTableService {

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _requests$ = new BehaviorSubject<MessageRequest[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private requestList: MessageRequest[] = [];

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe, private messageRequestService: MessageRequestService, private auth: AuthService) {
    
    auth.appUser$.subscribe(curUser => {
      if (!curUser.isAdmin) {
        messageRequestService.getAllReuqestsForSingleUser(auth.getCurrentUser().uid).valueChanges()
          .subscribe(requestList => {
            this.requestList = requestList
          });
      } else {
        messageRequestService.getAllReuqests().valueChanges()
          .subscribe(requestList => {
            this.requestList = requestList
          });
      }
      this._search$.pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => {
          return this._search()
        }),
        tap(() => this._loading$.next(false))
      ).subscribe(result => {
        this._requests$.next(result.requests);
        this._total$.next(result.total);
      });
  
      this._search$.next();
    })
  }

  get requests$() { return this._requests$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({ page }); }
  set pageSize(pageSize: number) { this._set({ pageSize }); }
  set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
  set sortColumn(sortColumn: string) { this._set({ sortColumn }); }
  set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    console.log("2.1 searching " + this._state);
    
    // 1. sort
    let requests = sort(this.requestList, sortColumn, sortDirection);

    console.log("2.2 after sorting " + requests);

    // 2. filter
    requests = requests.filter(request => matches(request, searchTerm, this.pipe));
    const total = requests.length;

    console.log("2.2 after filtering " + requests);

    // 3. paginate
    requests = requests.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    console.log("2.3. after formatting the requests are: " + requests);
    
    return of({ requests, total });
  }
}
