import { MessageRequestService } from './../../../../services/message-request.service';
import { AppUser } from 'src/app/models/app_user';
import { AuthService } from 'src/app/services/auth.service';
import { UploadService } from './../../../../services/upload.service';
import { map } from 'rxjs/operators';

import { MessageRequest, RequestStatus } from './../../../../models/message_request';
import { Component, ViewChildren, QueryList } from '@angular/core';
import { NgbdSortableHeader, SortEvent } from '../sortable.directive';
import { Observable } from 'rxjs';
import { RequestTableService } from '../request-table.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.css']
})
export class ApprovedComponent {

  mid: string;
  selectedRequest: MessageRequest = {};
  selectedDataReport: File;
  requests$: Observable<{ mid: string, messageRequest: MessageRequest }[]>;
  total$: Observable<number>;
  curAppUser$: Observable<AppUser>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private router: Router,
    public service: RequestTableService, 
    private modalService: NgbModal, 
    private uploadService: UploadService, 
    private auth: AuthService,
    private requestService: MessageRequestService
    ) {
      this.requests$ = service.requests$;
      this.requests$ = this.requests$.pipe(map(requestList => {
        requestList = requestList.filter(request => request.messageRequest.requestStatus == RequestStatus.APPROVED);
        return requestList;
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

  onSelectDataReportChanged(event) {
    this.selectedDataReport = event.target.files[0];
  }

  viewDetail(content, request: { mid: string, messageRequest: MessageRequest }) {
    this.selectedRequest = request.messageRequest;
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  openDataReportModal(uploadDataReportModal, request: { mid: string, messageRequest: MessageRequest }) {
    this.selectedRequest = request.messageRequest;
    this.mid = request.mid;
    this.modalService.open(uploadDataReportModal, {
      size: 'sm',
      scrollable: false,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  uploadDataReport() {
    let subPath: string = "/dataReport/" + this.selectedRequest.userName + "/";

    this.uploadService.uploadFile(this.selectedDataReport, subPath)
    .then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {
      console.log("Upload is complete!!!!");
      uploadSnapshot.ref.getDownloadURL().then((url) => {
        console.log(url);
        this.requestService.updateDataReportUrl(this.mid, url);
        this.requestService.updateRequestStatus(this.mid, RequestStatus.COMPLETED);
      })
    });

    this.service.pageSize = 11;
    this.router.navigate(['/request-history/', { outlets: { 'request-list': ['completed'] } }]);
  }
}
