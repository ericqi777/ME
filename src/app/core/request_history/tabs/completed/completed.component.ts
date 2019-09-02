import { map } from 'rxjs/operators';

import { MessageRequest, RequestStatus } from './../../../../models/message_request';
import { Component, ViewChildren, QueryList } from '@angular/core';
import { NgbdSortableHeader, SortEvent } from '../sortable.directive';
import { Observable } from 'rxjs';
import { RequestTableService } from '../request-table.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.css']
})
export class CompletedComponent {

  dataReportUrl: string;
  previewRequest: MessageRequest = {};
  requests$: Observable<{ mid: string, messageRequest: MessageRequest }[]>;
  total$: Observable<number>;

  filterListSize: number;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(public service: RequestTableService, private modalService: NgbModal) {
    this.requests$ = service.requests$;
    this.requests$ = this.requests$.pipe(map(requestList => {
      requestList = requestList.filter(request => request.messageRequest.requestStatus == RequestStatus.COMPLETED);
      this.filterListSize = requestList.length;
      console.log(this.filterListSize + " <+++ this is the size");
      
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

  viewDetail(content, request: { mid: string, messageRequest: MessageRequest }) {
    this.previewRequest = request.messageRequest;
    this.dataReportUrl = request.messageRequest.dataReportUrl;
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  downloadReport(url) {
    console.log(url);
    window.open(url);
    
  }
}
