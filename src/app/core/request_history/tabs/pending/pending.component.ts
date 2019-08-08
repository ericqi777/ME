import { AuthService } from './../../../../services/auth.service';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRequest, RequestStatus } from 'src/app/models/message_request';
import { NgbdSortableHeader, SortEvent } from '../sortable.directive';
import { RequestTableService } from '../request-table.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase'
import { AppUser } from 'src/app/models/app_user';
import { MessageRequestService } from 'src/app/services/message-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'pending-request',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent {
  
  basePath = "gs://mexitong-a8144.appspot.com";
  imageRef$;
  previewRequest: MessageRequest = {};
  previewRequestId: string;
  requests$: Observable<{ mid: string, messageRequest: MessageRequest }[]>;
  total$: Observable<number>;
  curAppUser$: Observable<AppUser>;
  uid = this.auth.getCurrentUser().uid;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    public service: RequestTableService, 
    private modalService: NgbModal, 
    private auth: AuthService, 
    private requestService: MessageRequestService,
    private router: Router) {
    this.requests$ = service.requests$;
    this.requests$ = this.requests$.pipe(map(requestList => {
      console.log("return size is: " + requestList.length);
      requestList = requestList.filter(request => request.messageRequest.requestStatus == RequestStatus.PENDING_REVIEW);
      return requestList.sort((a, b) => compare(a.messageRequest.createdAt, b.messageRequest.createdAt));
    }));
    this.total$ = service.total$;
    this.curAppUser$ = this.auth.appUser$;
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

  viewDetail(content, request: { mid: string, messageRequest: MessageRequest }) {
    this.previewRequest = request.messageRequest;
    this.previewRequestId = request.mid;
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  approveRequest() {
    if(this.previewRequest.approve == "") {
      this.requestService.updateApprovalStatue(this.previewRequestId, this.uid, true);
    } else {
      this.requestService.updateRequestStatus(this.previewRequestId, RequestStatus.APPROVED);
      this.service.pageSize = 11;
      this.router.navigate(['/request-history/', { outlets: { 'request-list': ['approved'] } }]);
    }
  }

  dropRequest() {
    this.requestService.updateRequestStatus(this.previewRequestId, RequestStatus.REJECTED);
    this.requestService.updateApprovalStatue(this.previewRequestId, this.uid, false);

    this.service.pageSize = 11;
    this.router.navigate(['/request-history/', { outlets: { 'request-list': ['rejected'] } }]);
  }

  canApprove() {
    return this.previewRequest.approve != this.uid;
  }

  downloadReport(url) {
    console.log(url);
    window.open(url);

  }
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}
