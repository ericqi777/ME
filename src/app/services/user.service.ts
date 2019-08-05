import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import * as firebase from 'firebase';
import { AppUser } from '../models/app_user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private db: AngularFireDatabase) { }

  save(user: firebase.User, allocatedCredit: number, isPowerUser: boolean) {
    
    this.db.object('/users/' + user.uid).update({
      name: user.displayName,
      email: user.email,
      credit: allocatedCredit,
      isPowerUser: isPowerUser,
      isAdmin: false,
      createdTime: new Date(),
      parentUser: firebase.auth().currentUser.displayName
    });
  }

  create(newUser: AppUser, newId: string) {
    console.log('/users/' + newId, newUser);
    
    this.db.object('/users/' + newId).set(newUser);
  }

  updateCredit(uid, newCredit) {
    console.log(uid);
    console.log(newCredit);
    
    this.db.object('/users/' + uid).update({credit: newCredit});
  }

  get(uid: string): AngularFireObject<AppUser> {
    return this.db.object('/users/' + uid);
  }

  batch_get(uid_list: string[]): AngularFireObject<AppUser>[] {
    let result_list ;
    uid_list.map(uid => {
      result_list.push(this.get(uid))
    })
    console.log(result_list);
    
    return result_list;
  }

  getAllUsers(): AngularFireList<AppUser> {
    return this.db.list('/users/', ref => ref.orderByChild('createdTime'));
  }

  deleteUser(uid: string) {
    return this.db.object('/users/' + uid).remove();
  }

  getRole(user: AppUser): string {
    if (user.isAdmin) {
      return "管理员";
    } else if (user.isPowerUser) {
      return "高级工号";
    } else {
      return "普通工号"
    }
  }
}