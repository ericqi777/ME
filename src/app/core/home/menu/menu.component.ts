import { AuthService } from './../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AppUser } from 'src/app/models/app_user';
import { Observable } from 'rxjs';

@Component({
  selector: 'menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  curAppUser$: Observable<AppUser>;

  constructor(private auth: AuthService) { 
    this.curAppUser$ = this.auth.appUser$;
  }

  ngOnInit() {
  }

}
