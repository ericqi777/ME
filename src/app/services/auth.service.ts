import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Injectable } from '@angular/core';

import * as firebase from 'firebase'
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { switchMap } from 'rxjs/operators';
import { empty } from 'rxjs'
import { AppUser } from '../models/app_user';

@Injectable()
export class AuthService {
  user$: Observable<firebase.User>
  error;

  constructor(
    private userService: UserService,
    private afAuth: AngularFireAuth, 
    private route: ActivatedRoute) {
    this.user$ = afAuth.authState;
  }

  login(email: string, password: string) {
    let url = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', url);
    return firebase.auth().signInWithEmailAndPassword(email, password).catch(error => error)
    
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  get appUser$(): Observable<AppUser> {
    return this.user$.pipe(
      switchMap(user => {
        if (user) return this.userService.get(user.uid).valueChanges();

        return empty();
      }));
  }
  
  getCurrentUser(): firebase.User {
    let user = firebase.auth().currentUser
    return user ? user : null;
  }
}
