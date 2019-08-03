import { MessageRequestService } from './../services/message-request.service';
import { MessageRequest, RequestStatus } from './../models/message_request';
import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataTableDataSource } from './data-table-datasource';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eric-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements AfterViewInit, OnInit, OnDestroy {
  ngOnDestroy(): void {
    console.log("data table is destroyed ?????????");
    
  }
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<MessageRequest>;
  dataSource: DataTableDataSource;

  messageRequestService: MessageRequestService;
  authService: AuthService;
  statusParam: string;

  constructor(
    private route: ActivatedRoute,
    messageRequestService: MessageRequestService, 
    authService: AuthService) {
    this.authService = authService;
    this.messageRequestService = messageRequestService;

    
  }
  
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['time', 'content', 'cost', 'status', 'action'];
  
  ngOnInit() {
    this.statusParam = this.route.snapshot.paramMap.get('id');
    console.log("yarn............." + this.statusParam);
    this.dataSource = new DataTableDataSource(this.messageRequestService, this.authService, RequestStatus[ this.statusParam ] );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
