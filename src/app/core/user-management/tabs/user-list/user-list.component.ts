
import { UserService } from '../../../../services/user.service';
import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { AppUser } from 'src/app/models/app_user';
import { AuthService } from 'src/app/services/auth.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/core/request_history/tabs/sortable.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserTableService } from './user_table_service/user-table.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  targetUser: {uid: string, user:AppUser};
  inputCredit: number;

  curAppUser: AppUser;
  curUserId: string = this.auth.getCurrentUser().uid;
  curCredit$: number = 0;

  //userList$: Observable<{ uid: string, user: AppUser }[]>;
  userList: { uid: string, user: AppUser }[] = [];
  filteredUserList: { uid: string, user: AppUser }[] = [];
  //total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private userService: UserService, 
    private auth: AuthService, 
    public service: UserTableService, 
    private modalService: NgbModal,
    ) {
    auth.appUser$.subscribe(appUser => {
      this.curAppUser = appUser;
      this.curCredit$ = appUser.credit;
      this.userService.getAllUsers().snapshotChanges().subscribe(snapshot => {
        snapshot.map(child => {
          let childUser = {
            uid: child.payload.key,
            user: child.payload.val()
          };

          if (this.curAppUser.isAdmin) {
            this.userList.push(childUser);
          } else if (this.curAppUser.isPowerUser) {
            childUser.user.parentUser == this.curUserId ? this.userList.push(childUser) : this.userList;
          }
          this.filteredUserList = this.userList;
        })
      });
    });
  }

  removeUser(uid: string, returnCredit: number) {
    this.userService.deleteUser(uid);
    this.userService.updateCredit(this.curUserId, this.curCredit$ + returnCredit);
  }

  addCredit() {
    console.log("uid ", this.targetUser.uid);
    console.log("creditChange ", this.inputCredit);
    console.log("creditBase ", this.targetUser.user.credit);

    this.userService.updateCredit(this.targetUser.uid, this.targetUser.user.credit + this.inputCredit)
    this.userService.updateCredit(this.curUserId, this.curCredit$ - this.inputCredit);
  }

  substractCredit() {
    console.log("uid ", this.targetUser.uid);
    console.log("creditChange ", this.inputCredit);
    console.log("creditBase ", this.targetUser.user.credit);

    //Subtract target user credit
    this.userService.updateCredit(this.targetUser.uid, this.targetUser.user.credit - this.inputCredit)
    //Add current user credot
    this.userService.updateCredit(this.curUserId, this.curCredit$ + this.inputCredit);
  }

  getRole(user: AppUser): string {
    return this.userService.getRole(user);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  filterList(query: string) {
    this.filteredUserList = this.userList.filter(appUser => {
      return appUser.user.userName.toLowerCase().includes(query) ||
        appUser.user.email.toLowerCase().includes(query) ||
        appUser.user.email.toLowerCase().includes(query) ||
        appUser.user.createdTime.toLowerCase().includes(query) ||
        this.userService.getRole(appUser.user).toLowerCase().includes(query);
    })
  }

  previewAddCredit(addCredit, targetUser) {
    this.targetUser = targetUser;
    this.modalService.open(addCredit, {
      size: 'sm',
      ariaLabelledBy: 'addCredit'
    });
  }

  previewSubtractCredit(subtractCredit, targetUser) {
    this.targetUser = targetUser;
    this.modalService.open(subtractCredit, {
      size: 'sm',
      ariaLabelledBy: 'subtractCredit'
    });
  }

  ngOnInit() {
  }

}
