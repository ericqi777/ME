import { AuthService } from './../../../services/auth.service';
import { MessageRequestService } from './../../../services/message-request.service';
import { MessageRequest } from './../../../models/message_request';
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from './sortable.directive';

interface SearchResult {
  requests: { mid: string, messageRequest: MessageRequest }[];
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

function sort(requests: {mid: string, messageRequest: MessageRequest}[], column: string, direction: string) {
  if (direction === '') {
    return requests;
  } else {
    return [...requests].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(request: { mid: string, messageRequest: MessageRequest }, term: string, pipe: PipeTransform) {
  if (!request) {
    return false;
  } else {
    console.log("here is the request " + request);
    
    return request.messageRequest.createdAt.toLowerCase().includes(term.toLowerCase())
      || request.messageRequest.textContent.valueOf().toLowerCase().includes(term.toLowerCase())
      || request.messageRequest.requestStatus.toLowerCase().includes(term.toLowerCase())
      || pipe.transform(request.messageRequest.creditCost).includes(term);

  }
}

@Injectable({ providedIn: 'root' })
export class RequestTableService {

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _requests$ = new BehaviorSubject<{ mid: string, messageRequest: MessageRequest }[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private requestList: {mid: string, messageRequest: MessageRequest}[] = [];

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe, private messageRequestService: MessageRequestService, private auth: AuthService) {
    
    let curAppUserId = this.auth.getCurrentUser().uid;
    auth.appUser$.subscribe(curUser => {
      messageRequestService.getAllReuqests().snapshotChanges()
        .subscribe(requestList => {
          requestList.map(request => {
            let childRequest = {
              mid: request.payload.key,
              messageRequest: request.payload.val()
            }
            if (!curUser.isAdmin) {
              if (childRequest.mid == curAppUserId) {
                this.requestList.push(childRequest);
              }
            } else {
              this.requestList.push(childRequest);
            }
          })
        })
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
    
    // 1. sort
    let requests = sort(this.requestList, sortColumn, sortDirection);

    // 2. filter
    requests = requests.filter(request => matches(request, searchTerm, this.pipe));
    const total = requests.length;

    // 3. paginate
    requests = requests.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    
    return of({ requests, total });
  }
}
