import { NgbdSortableHeader } from './core/request_history/tabs/sortable.directive';
import { DateService } from './services/date.service';
import { MessageRequestService } from './services/message-request.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UploadService } from './services/upload.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from "angularfire2";
import { AngularFireDatabaseModule } from "angularfire2/database";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './core/home/nav/nav.component';
import { MenuComponent } from './core/home/menu/menu.component';
import { MessageEditorComponent } from './core/message_request/message-editor/message-editor.component';
import { RouterModule } from '@angular/router';
import { RequestHistoryComponent } from './core/request_history/request-history/request-history.component';
import { HomeContainerComponent } from './core/home/home_container/home-container/home-container.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './core/login/login/login.component';
import { MessageModifyComponent } from './core/message_request/message-modify/message-modify.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DataTableComponent } from './data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PendingComponent } from './core/request_history/tabs/pending/pending.component';
import { RejectedComponent } from './core/request_history/tabs/rejected/rejected.component';
import { ApprovedComponent } from './core/request_history/tabs/approved/approved.component';
import { CompletedComponent } from './core/request_history/tabs/completed/completed.component';
import { RequestTableService } from './core/request_history/tabs/request-table.service';
import { UserCreateComponent } from './core/user-management/tabs/user-create/user-create.component';
import { UserListComponent } from './core/user-management/tabs/user-list/user-list.component';
import { UserManagermentComponent } from './core/user-management/user-managerment/user-managerment.component';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MenuComponent,
    MessageEditorComponent,
    RequestHistoryComponent,
    HomeContainerComponent,
    LoginComponent,
    MessageModifyComponent,
    DataTableComponent,
    PendingComponent,
    RejectedComponent,
    ApprovedComponent,
    CompletedComponent,
    NgbdSortableHeader,
    UserCreateComponent,
    UserListComponent,
    UserManagermentComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule, 
    DataTablesModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    NgbModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    RouterModule.forRoot([
      { path: '', component: HomeContainerComponent },     
      { 
        path: 'request-history', 
        component: RequestHistoryComponent,
        children: [
          { path: '', outlet: 'request-list', component: PendingComponent },
          { path: 'pending', outlet: 'request-list', component: PendingComponent },
          { path: 'rejected', outlet: 'request-list', component: RejectedComponent },
          { path: 'approved', outlet: 'request-list', component: ApprovedComponent },
          { path: 'completed', outlet: 'request-list', component: CompletedComponent },
        ] 
      },
      { path: 'request-edit', component: MessageEditorComponent },  
      { path: 'user-management/manage', component: UserListComponent },   
      { path: 'user-management/create', component: UserCreateComponent },  
      { 
        path: 'user-management', 
        component: UserManagermentComponent,
        children: [
          { path: '', outlet: 'user-management', component: UserListComponent },
          { path: 'manage', outlet: 'user-management', component: UserListComponent },
          { path: 'create', outlet: 'user-management', component: UserCreateComponent },
        ]
      },  
    ]),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    DateService,
    UploadService,
    UserService,
    AuthService,
    MessageRequestService,
    RequestTableService,
    RequestHistoryComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
