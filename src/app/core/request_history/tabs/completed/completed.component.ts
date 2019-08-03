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

  previewRequest: MessageRequest = {};
  requests$: Observable<MessageRequest[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(public service: RequestTableService, private modalService: NgbModal) {
    this.requests$ = service.requests$;
    this.requests$ = this.requests$.pipe(map(requestList => {
      requestList = requestList.filter(request => request.requestStatus == RequestStatus.COMPLETED);
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

  viewDetail(content, request) {
    this.previewRequest = request;
    this.modalService.open(content, {
      size: 'lg',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title'
    });
  }
}
