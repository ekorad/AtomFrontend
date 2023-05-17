import { PermissionQuickviewComponent } from './../permission-quickview/permission-quickview.component';
import { UserPermission } from 'src/app/models/user-permission';
import { UserRole } from './../../../models/user-role';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-role-quickview',
  templateUrl: './role-quickview.component.html',
  styleUrls: ['./role-quickview.component.css']
})
export class RoleQuickviewComponent implements OnInit {

  @Input() selectedRole?: UserRole;
  @Input() permMap?: Map<string, UserPermission>;
  @ViewChild(PermissionQuickviewComponent, { static: false }) permViewer!: PermissionQuickviewComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onPermQuickview(permName: string): void {
    if (this.permMap) {
      this.permViewer.selectedPerm = this.permMap.get(permName);
    }
  }

}
