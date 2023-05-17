import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { Order } from './../../../models/order';
import { OrderService } from './../../../services/order.service';
import { OrderDetailsViewerComponent } from './../../sub/order-details-viewer/order-details-viewer.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  private readonly orderObserver: Observer<Order[]> = {
    next: recvOrders => {
      this.dataSource.data = recvOrders;
    },
    error: err => {
      console.log(err);
      this.resourcesLoading.orders.error = true;
      this.resourcesLoading.orders.loading = false;
      this.checkLoading();
    },
    complete: () => {
      this.resourcesLoading.orders.loading = false;
      this.checkLoading();
    }
  };
  private resourcesLoading = { orders: { loading: false, error: false } };
  readonly columnsToBeDisplayed = ['select', 'id', 'stage', 'address', 'phoneNumber', 'deliveryMethod', 'paymentMethod', 'view'];

  initialLoading = true;
  dataSource = new MatTableDataSource<Order>();
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(OrderDetailsViewerComponent, { static: false }) orderDetailsViewer!: OrderDetailsViewerComponent;
  selection = new SelectionModel<Order>(true, []);
  deleteLoading = false;

  orderForEdit: Order | null = null;
  orderForView: Order | null = null;

  constructor(private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private orderService: OrderService) {
    if (this.activatedRoute.snapshot.data.title) {
      this.titleService.setTitle(this.activatedRoute.snapshot.data.title);
    }
  }

  ngOnInit(): void {
    this.resourcesLoading = { orders: { loading: true, error: false } };

    this.orderService.getAll().subscribe(this.orderObserver);
    this.dataSource.filterPredicate = (data: Order, filter: string) => {
      let dataStr = (data.id + ' ' + data.address + ' ' + data.deliveryMethod + ' ' + data.paymentMethod + ' ' + data.phoneNumber + ' ' + data.stage).toLowerCase();
      const filters: string[] = filter.replace(/\s+/g, ' ').split(' ');
      for (const singleFilter of filters) {
        if (!dataStr.includes(singleFilter)) {
          return false;
        } else {
          dataStr = dataStr.replace(singleFilter, '');
        }
      }
      return true;
    };
  }

  isLoading(): boolean {
    return this.resourcesLoading.orders.loading;
  }

  hasLoadingErrors(): boolean {
    return this.resourcesLoading.orders.error;
  }

  clearLoadingErrors(): void {
    this.resourcesLoading.orders.error = false;
  }

  setLoadingStatus(): void {
    this.resourcesLoading.orders.loading = true;
  }

  checkLoading(): void {
    if (this.isLoading() === false) {
      this.onFinishLoading();
    }
  }

  onFinishLoading(): void {
    if (this.hasLoadingErrors()) {
      this.snackBar.open('A aparut o eroare. Te rugam sa incerci din nou',
        'Inchide', { duration: 8000 });
      this.clearLoadingErrors();
      return;
    }

    this.cd.detectChanges();
    this.dataSource.filter = '';
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.initialLoading) {
      this.initialLoading = false;
      return;
    }

    this.snackBar.open('Datele au fost incarcate cu succes',
      'Inchide', { duration: 3000 });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  refreshContent(): void {
    this.setLoadingStatus();
    this.orderService.getAll().subscribe(this.orderObserver);
  }

  tableIsAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  tableMasterToggle(): void {
    this.tableIsAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onClickDelete(): void {
    if (this.selection.hasValue()) {
      this.deleteLoading = true;

      this.orderService.deleteOrders(this.selection.selected.map(prod => prod.id))
        .subscribe(stuff => { },
          err => {
            console.log(err);
            this.snackBar.open('A aparut o eroare. Te rugam sa incerci din nou',
              'Inchide', { duration: 8000 });
            this.deleteLoading = false;
          },
          () => {
            this.selection.clear();
            this.refreshContent();
            this.deleteLoading = false;
          });
    }
  }

  onChildRequestRefresh(): void {
    this.refreshContent();
  }

  editOrder(order: Order): void {

  }

  viewOrderDetails(order: Order): void {
    this.orderForView = order;
    this.orderDetailsViewer.setSelectedOrder(order);
  }
}
