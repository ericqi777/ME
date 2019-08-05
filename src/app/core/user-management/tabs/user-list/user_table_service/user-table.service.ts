import { AppUser } from './../../../../../models/app_user';
import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { DateService } from 'src/app/services/date.service';
import { SortDirection } from 'src/app/core/request_history/tabs/sortable.directive';
import { AuthService } from 'src/app/services/auth.service';

interface SearchResult {
  users: { uid: string, user: AppUser }[];
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

function sort(appUsers: { uid: string, user: AppUser }[], column: string, direction: string): { uid: string, user: AppUser }[] {
  if (direction === '') {
    return appUsers;
  } else {
    return [...appUsers].sort((a, b) => {
      const res = compare(a.user[column], b.user[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(appUser: {uid: string, user: AppUser}, term: string, pipe: PipeTransform) {
  //return true;
  if (!appUser.user) {
    return false;
  } else {
    console.log("here is the user " + appUser.user);

    return appUser.user.userName.toLowerCase().includes(term.toLowerCase())
      || appUser.user.createdTime.valueOf().toLowerCase().includes(term.toLowerCase())
      || pipe.transform(appUser.user.credit).includes(term);
  }
}

@Injectable({ providedIn: 'root' })
export class UserTableService {

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  private _users$ = new BehaviorSubject<{ uid: string, user: AppUser }[]>([]);

  userList: {uid: string, user: AppUser}[] = [];

  curUserId: string = this.auth.getCurrentUser().uid;
  curCredit$: number = 0;

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe, private userService: UserService, private auth: AuthService, private dateService: DateService) {

    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => {
        return this._search()
      }),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._users$.next(result.users);
      this._total$.next(result.total);
    });

    this._search$.next();
    
  }

  get users$() { return this._users$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get rawUserList() { return this.userList; }

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
    let users = sort(this.userList, sortColumn, sortDirection);

    //console.log("2.2 after sorting " + users);

    // 2. filter
    users = users.filter(appUser => matches(appUser, searchTerm, this.pipe));
    const total = users.length;

    //console.log("2.2 after filtering " + users);

    // 3. paginate
    users = users.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    //console.log("2.3. after formatting the users are: " + users);

    return of({ users, total });
  }
}
