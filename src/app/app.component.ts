import { Component } from '@angular/core';
import { AppUser } from './models/app_user';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ME信息管理平台';

  appUser: AppUser;

  constructor(private auth: AuthService) {
    auth.appUser$.subscribe(appUser => this.appUser = appUser)
  }

  logout() {
    this.auth.logout();
    this.appUser = null;
  }
}
