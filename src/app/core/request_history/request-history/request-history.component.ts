import { AuthService } from './../../../services/auth.service';
import { MessageRequest, RequestStatus } from './../../../models/message_request';
import { MessageRequestService } from './../../../services/message-request.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-request-history',
  templateUrl: './request-history.component.html',
  styleUrls: ['./request-history.component.css']
})
export class RequestHistoryComponent {
  
  constructor() { }

}
