import { MessageRequest, RequestStatus } from './../models/message_request';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { MessageRequestService } from '../services/message-request.service';
import { AuthService } from '../services/auth.service';

/**
 * Data source for the DataTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DataTableDataSource extends DataSource<MessageRequest> {
  data: MessageRequest[];
  paginator: MatPaginator;
  sort: MatSort;
  resultMap: Map<RequestStatus, MessageRequest[]> = new Map;

  constructor(private messageRequestService: MessageRequestService, private authService: AuthService, private statusParam: RequestStatus) {
    super();
    let currentUid = this.authService.getCurrentUser().uid;

    this.messageRequestService.getAllReuqestsForSingleUser(currentUid).valueChanges()
    .subscribe(requestList => {
      requestList.map(request => {
        if (this.resultMap.has(request.requestStatus)) {
          this.resultMap.get(request.requestStatus).push(request);
        } else {
          this.resultMap.set(request.requestStatus, [request])
        }
      })
      this.data = this.resultMap.get(statusParam)
    })
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<MessageRequest[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: MessageRequest[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: MessageRequest[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'time': return compare(a.createdAt, b.createdAt, isAsc);
        case 'cost': return compare(+a.creditCost, +b.creditCost, isAsc);
        case 'status': return compare(+a.requestStatus, +b.requestStatus, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
