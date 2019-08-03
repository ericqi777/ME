import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRequest, RequestStatus } from 'src/app/models/message_request';
import { NgbdSortableHeader, SortEvent } from '../sortable.directive';
import { RequestTableService } from '../request-table.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase'

@Component({
  selector: 'pending-request',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent {
  
  basePath = "gs://mexitong-a8144.appspot.com";
  imageRef$;
  previewRequest: MessageRequest = {};
  requests$: Observable<MessageRequest[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(public service: RequestTableService, private modalService: NgbModal) {
    this.requests$ = service.requests$;
    this.requests$ = this.requests$.pipe(map(requestList => {
      requestList = requestList.filter(request => request.requestStatus == RequestStatus.PENDING_REVIEW);
      return requestList;
    }));
    this.total$ = service.total$;
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

  viewDetail(content, request: MessageRequest) {
    this.previewRequest = request;
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

}
