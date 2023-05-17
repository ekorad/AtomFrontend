import { MatExpansionPanel } from '@angular/material/expansion';
import { map } from 'rxjs/operators';
import { UserComponent } from './../../sub/user/user.component';
import { UserRole } from './../../../models/user-role';
import { UserPermission } from 'src/app/models/user-permission';
import { UserPermissionService } from './../../../services/user-permission.service';
import { UserRoleService } from './../../../services/user-role.service';
import { RoleQuickviewComponent } from './../../sub/role-quickview/role-quickview.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PartialObserver } from 'rxjs';
import { User } from './../../../models/user';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from './../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-web-users',
  templateUrl: './web-users.component.html',
  styleUrls: ['./web-users.component.css']
})
export class WebUsersComponent implements OnInit {

  private readonly usersObserver: PartialObserver<User[]> = {
    next: recvUsers => this.dataSource.data = recvUsers,
    complete: () => {
      this.resourcesLoading.usersLoading = false;
      this.checkLoadingFinished();
    }
  };

  private readonly rolesObserver: PartialObserver<UserRole[]> = {
    next: recvRoles => {
      this.roleMap = new Map(recvRoles.map(role => [role.name, role]));
    },
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

  deleteLoading = false;
  permMap!: Map<string, UserPermission>;
  roleMap!: Map<string, UserRole>;
  dataSource = new MatTableDataSource<User>();
  resourcesLoading = { usersLoading: false, rolesLoading: false, permsLoading: false };
  readonly columnsToBeDisplayed = ['select', 'id', 'username', 'firstName', 'lastName', 'email', 'password', 'locked', 'activated', 'role', 'edit'];
  firstLoad = true;
  selection = new SelectionModel<User>(true, []);
  userForEdit: User | null = null;
  @ViewChild('userEditorPanel', { static: false }) userEditorPanel!: MatExpansionPanel;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(RoleQuickviewComponent, { static: false }) roleViewer!: RoleQuickviewComponent;
  @ViewChild('userAdder', { static: false }) userAdder!: UserComponent;
  @ViewChild('userEditor', { static: false }) userEditor!: UserComponent;

  constructor(private title: Title,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private roleService: UserRoleService,
    private permService: UserPermissionService) {
    if (activatedRoute.snapshot.data.title) {
      title.setTitle(activatedRoute.snapshot.data.title);
    } else {
      title.setTitle('Administrare conturi utilizatori')
    }
  }

  ngOnInit(): void {
    this.resourcesLoading = { usersLoading: true, rolesLoading: true, permsLoading: true };
    this.userService.getAll().subscribe(this.usersObserver);
    this.roleService.getAll().subscribe(this.rolesObserver);
    this.permService.getAll().subscribe(this.permsObserver);

    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().replace(/\s+/g, ' ');
  }

  areResourcesLoading(): boolean {
    return this.resourcesLoading.usersLoading || this.resourcesLoading.rolesLoading || this.resourcesLoading.permsLoading;
  }

  checkLoadingFinished(): void {
    if (!this.areResourcesLoading()) {
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

    this.userAdder.roles = Array.from(this.roleMap.values()).map(role => role.name);
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

  onClickRefresh(): void {
    this.refreshContent();
  }

  private refreshContent(): void {
    this.resourcesLoading = { usersLoading: true, rolesLoading: true, permsLoading: true };
    this.userService.getAll().subscribe(this.usersObserver);
    this.roleService.getAll().subscribe(this.rolesObserver);
    this.permService.getAll().subscribe(this.permsObserver);
  }

  private customFilterPredicate(data: User, filter: string): boolean {
    const filterKeys = ['id', 'firstName', 'lastName', 'username', 'email', 'role'];
    let dataStr = filterKeys.map(key => data[key]).join(' ');

    let activeFilter: boolean | null = null;
    let lockedFilter: boolean | null = null;
    let localFilter = filter;

    if (localFilter.search(/\bactivat\b/) !== -1) {
      activeFilter = true;
      localFilter = localFilter.replace(/\bactivat\b/, '');
    } else if (localFilter.search(/\bdezactivat\b/) !== -1) {
      activeFilter = false;
      localFilter = localFilter.replace(/\bdezactivat\b/, '');
    }

    if (localFilter.search(/\bblocat\b/) !== -1) {
      lockedFilter = true;
      localFilter = localFilter.replace(/\bblocat\b/, '');
    } else if (localFilter.search(/\bdeblocat\b/) !== -1) {
      lockedFilter = false;
      localFilter = localFilter.replace(/\bdeblocat\b/, '');
    }

    if (activeFilter !== null) {
      if (data.activated !== activeFilter) {
        return false;
      }
    }

    if (lockedFilter !== null) {
      if (data.locked !== lockedFilter) {
        return false;
      }
    }

    const filters: string[] = localFilter.replace(/\s+/g, ' ').split(' ');
    for (const singleFilter of filters) {
      if (!dataStr.includes(singleFilter)) {
        return false;
      } else {
        dataStr = dataStr.replace(singleFilter, '');
      }
    }
    return true;
  }

  quickViewRole(roleName: string): void {
    this.roleViewer.selectedRole = this.roleMap.get(roleName);
    this.roleViewer.permMap = this.permMap;
  }

  onClickDelete(): void {
    if (this.selection.hasValue()) {
      this.deleteLoading = true;

      this.userService.deleteUsers(this.selection.selected.map(user => user.username))
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

  editUser(user: User): void {
    this.userForEdit = user;

    this.cd.detectChanges();
    this.userEditor.roles = Array.from(this.roleMap.values()).map(role => role.name);
    this.userEditor.setEditData(user);
    this.userEditorPanel.open();
  }

}
