import { RoleComponent } from './../../sub/role/role.component';
import { PermissionQuickviewComponent } from './../../sub/permission-quickview/permission-quickview.component';
import { UserPermissionService } from './../../../services/user-permission.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserRole } from './../../../models/user-role';
import { PartialObserver, Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserRoleService } from './../../../services/user-role.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UserPermission } from 'src/app/models/user-permission';
import { MatExpansionPanel } from '@angular/material/expansion';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent implements OnInit {

  private readonly rolesObserver: PartialObserver<UserRole[]> = {
    next: recvRoles => this.dataSource.data = recvRoles,
    complete: () => {
      this.resourcesLoading.rolesLoading = false;
      this.checkLoadingFinished();
    }
  };

  private readonly permsObserver: PartialObserver<UserPermission[]> = {
    next: recvPerms => {
      this.permMap = new Map(recvPerms.map(perm => [perm.name, perm]));
    },
    complete: () => {
      this.resourcesLoading.permsLoading = false;
      this.checkLoadingFinished();
    }
  };

  firstLoad = true;
  deleteLoading = false;
  permMap!: Map<string, UserPermission>;
  resourcesLoading = { rolesLoading: false, permsLoading: false };
  dataSource: MatTableDataSource<UserRole> = new MatTableDataSource<UserRole>();
  columnsToBeDisplayed = ['select', 'id', 'name', 'permissions', 'description', 'edit'];
  private readonly READONLY_ROLE_NAMES = ['ADMIN', 'MODERATOR', 'USER'];
  roleForEdit: UserRole | null = null;
  selection = new SelectionModel<UserRole>(true, []);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(PermissionQuickviewComponent, { static: false }) permViewer!: PermissionQuickviewComponent;
  @ViewChild('roleAdder', { static: false }) roleAdder!: RoleComponent;
  @ViewChild('roleEditor', { static: false }) roleEditor!: RoleComponent;
  @ViewChild('roleEditorPanel', { static: false }) roleEditorPanel!: MatExpansionPanel;

  constructor(private title: Title,
    private roleService: UserRoleService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private permService: UserPermissionService) {
    this.title.setTitle('Administrare roluri');
  }

  ngOnInit(): void {
    this.resourcesLoading = { rolesLoading: true, permsLoading: true };
    this.roleService.getAll().subscribe(this.rolesObserver);
    this.permService.getAll().subscribe(this.permsObserver);

    this.dataSource.filterPredicate = (data: UserRole, filter: string) => {
      const permissionsStr = data.permissions.join(' ');
      let dataStr = (data.id + ' ' + data.name + ' ' + permissionsStr
        + ' ' + data.description).toLowerCase();
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

  private refreshContent(): void {
    this.resourcesLoading = { rolesLoading: true, permsLoading: true };
    this.roleService.getAll().subscribe(this.rolesObserver);
    this.permService.getAll().subscribe(this.permsObserver);
    this.roleForEdit = null;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  onClickRefresh(): void {
    this.refreshContent();
  }

  onClickDelete(): void {
    if (this.selection.hasValue()) {
      this.deleteLoading = true;

      this.roleService.deleteRoles(this.selection.selected.map(role => role.name))
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

  checkLoadingFinished(): void {
    if (!this.isLoading()) {
      this.onFinishLoading();
    }
  }

  onFinishLoading(): void {
    if (!this.firstLoad) {
      this.snackBar.open('Datele au fost incarcate cu succes',
        'Inchide', { duration: 3000 });
    }

    if (this.firstLoad) {
      this.firstLoad = false;
    }

    this.cd.detectChanges();
    this.dataSource.filter = '';
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const permNames = Array.from(this.permMap.values()).map(perm => perm.name);
    const usedRoleNames = this.dataSource.data.map(role => role.name);
    this.roleAdder.setData(permNames, usedRoleNames);
  }

  isLoading(): boolean {
    return this.resourcesLoading.permsLoading || this.resourcesLoading.rolesLoading;
  }

  updatePermViewer(permName: string): void {
    this.permViewer.selectedPerm = this.permMap.get(permName);
  }

  onChildRequestRefresh(): void {
    this.refreshContent();
  }

  isReadonlyRole(role: UserRole): boolean {
    if (this.READONLY_ROLE_NAMES.includes(role.name)) {
      return true;
    }
    return false;
  }

  editRole(role: UserRole): void {
    this.roleForEdit = role;

    this.cd.detectChanges();
    const permNames = Array.from(this.permMap.values()).map(perm => perm.name);
    const usedRoleNames = this.dataSource.data.map(r => r.name);
    this.roleEditor.setData(permNames, usedRoleNames);

    this.roleEditor.setEditData(role.name, role.description, role.permissions);

    this.roleEditorPanel.open();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length - this.READONLY_ROLE_NAMES.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.filter(role => !this.READONLY_ROLE_NAMES.includes(role.name)).forEach(row => this.selection.select(row));
  }
}
