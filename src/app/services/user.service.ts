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
}