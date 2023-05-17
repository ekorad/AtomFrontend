import { UserPermission } from './../../../models/user-permission';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-permission-quickview',
  templateUrl: './permission-quickview.component.html',
  styleUrls: ['./permission-quickview.component.css']
})
export class PermissionQuickviewComponent implements OnInit {

  @Input() selectedPerm?: UserPermission;

  constructor() { }

  ngOnInit(): void {
  }

}
