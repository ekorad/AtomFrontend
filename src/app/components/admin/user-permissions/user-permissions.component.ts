import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { PartialObserver } from 'rxjs';
import { UserPermission } from './../../../models/user-permission';
import { UserPermissionService } from './../../../services/user-permission.service';

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.css']
})
export class UserPermissionsComponent implements OnInit {

  private readonly initialObserver: PartialObserver<UserPermission[]> = {
    next: recvPerms => this.dataSource.data = recvPerms,
    complete: () => this.onFinishLoading()
  };

  private readonly refreshObserver: PartialObserver<UserPermission[]> = {
    next: recvPerms => this.dataSource.data = recvPerms,
    complete: () => {
      this.onFinishLoading();
      this.snackBar.open('Datele au fost incarcate cu succes',
        'Inchide', { duration: 3000 });
    }
  };

  isLoading = false;
  dataSource: MatTableDataSource<UserPermission> = new MatTableDataSource<UserPermission>();
  columnsToBeDisplayed = ['id', 'name', 'description'];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private title: Title,
              private permService: UserPermissionService,
              private cd: ChangeDetectorRef,
              private snackBar: MatSnackBar) {
    this.title.setTitle('Administrare permisiuni');
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.permService.getAll().subscribe(this.initialObserver);

    this.dataSource.filterPredicate = (data: UserPermission, filter: string) => {
      let dataStr = (data.id + ' ' + data.name + ' ' + data.description).toLowerCase();
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

  onClick(): void {
    this.refreshContent();
  }

  private refreshContent(): void {
    this.isLoading = true;
    this.permService.getAll().subscribe(this.refreshObserver);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  onFinishLoading(): void {
    this.isLoading = false;
    this.cd.detectChanges();
    this.dataSource.filter = '';
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
