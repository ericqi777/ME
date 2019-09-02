import { UserTableService } from './../user-list/user_table_service/user-table.service';
import { AppUser } from './../../../../models/app_user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from './../../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { DateService } from 'src/app/services/date.service';
import { Router } from '@angular/router';
import { delay } from 'q';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  router: Router;

  inputEmail;
  inputUserName;
  inputCredit: number = 0;
  curCredit$: number = 0;
  defaultPassword: string = "336688";
  newAppUser: AppUser = {};
  curAppUser: AppUser;

  currentEmailList: string[] = [];
  currentUserNameList: string[] = [];

  constructor(
    private userService: UserService, 
    private auth: AuthService, 
    private dateService: DateService, 
    router: Router
    ) {
      this.router = router;
      auth.appUser$.subscribe(appUser => {
        this.curAppUser = appUser;
        this.curCredit$ = appUser.credit;
        this.userService.getAllUsers().valueChanges()
        .subscribe(userList => {
          userList.map(user => {
            this.currentEmailList.push(user.email);
            this.currentUserNameList.push(user.userName);
          })
        })
      });
    } 

  ngOnInit() {
  }

  isValidEmail() {
    return this.currentEmailList.find(emailAddress => emailAddress == this.inputEmail) ? false : true;   
  }

  isValidUserName() {
    return this.currentUserNameList.find(userName => userName == this.inputUserName) ? false : true;
  }

  createUser() {
    let secondaryApp = firebase.initializeApp(environment.firebase, "Secondary");
    let localRouter = this.router;
    let localUserService = this.userService;
    let localAuth = this.auth;
    let localPostCredit$ = this.curCredit$ - this.inputCredit;
    let localAppUser = this.newAppUser;

    this.formateNewUser();
    secondaryApp.auth().createUserWithEmailAndPassword(this.newAppUser.email, this.defaultPassword).then(function (firebaseUser) {
      let newId = firebaseUser.user.uid;
      console.log("User " + firebaseUser.user.uid + " created successfully!");
      //I don't know if the next statement is necessary 
      secondaryApp.auth().signOut();
      
      localRouter.navigate(['/user-management']);
      localUserService.create(localAppUser, newId);
      localUserService.updateCredit(localAuth.getCurrentUser().uid, localPostCredit$);
      delay(300);
      localRouter.navigate(['/user-management/', { outlets: { 'user-management': ['create'] } }]);
      localRouter.navigate(['/user-management']);
    })
  }

  formateNewUser() {
    this.newAppUser.userName = this.inputUserName;
    this.newAppUser.email = this.inputEmail;
    this.newAppUser.credit = this.inputCredit;
    this.newAppUser.isAdmin = false;
    this.newAppUser.isPowerUser = false;
    this.newAppUser.parentUser = this.auth.getCurrentUser().uid;
    this.newAppUser.createdTime = this.dateService.getChinaTime();
  }

  createNewAuth() {

  }
}
