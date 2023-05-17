import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, NgForm, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from './../../../models/user-role';
import { UserRoleService } from './../../../services/user-role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  @ViewChild('form') form!: NgForm;
  @Input() operationType: 'edit' | 'add' = 'add';
  permissions: string[] = [];
  usedRoleNames: string[] = [];
  roleForm = this.fb.group({
    name: ['', { validators: [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z_]+$/), this.roleNameTakenValidator()], updateOn: 'blur' }],
    description: ['', { validators: [Validators.required, Validators.minLength(5)], updateOn: 'blur' }],
    permissions: new FormArray([])
  });
  checkedStatus: 'none' | 'some' | 'all' = 'none';
  permissionChecks?: { permName: string, checked: boolean }[];
  loadingStatus = false;
  initialRoleForEditName = '';
  @Output() requestRefresh = new EventEmitter<string>();

  constructor(private fb: FormBuilder,
    private roleService: UserRoleService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  setData(perms: string[], names: string[]): void {
    this.permissions = perms;
    this.usedRoleNames = names;

    this.permissionChecks = this.permissions.map(perm => {
      return { permName: perm, checked: false };
    });
  }

  setSelecterPermissions(perms: string[]): void {
    if (this.permissionChecks) {
      if (perms.length > 0 && perms.length < this.permissionChecks.length) {
        this.permissionChecks.filter(permCheck => perms.includes(permCheck.permName))
          .forEach(permCheck => permCheck.checked = true);
        this.checkedStatus = 'some';
        this.permissionChecks.filter(permCheck => permCheck.checked === true)
          .forEach(permCheck => this.formPermissions.push(new FormControl(permCheck.permName)));
      } else if (perms.length === this.permissionChecks.length) {
        this.setCheckedAll(true);
      }
    }
  }

  setEditData(roleName: string, roleDescription: string, rolePermissions: string[]): void {
    this.initialRoleForEditName = roleName;
    this.form.resetForm();
    this.name.setValue(roleName);
    this.description.setValue(roleDescription);
    this.setSelecterPermissions(rolePermissions);
  }

  onCheckChange(event: MatCheckboxChange): void {
    if (event.checked) {
      this.formPermissions.push(new FormControl(event.source.value));
    } else {
      let i = 0;
      this.formPermissions.controls.forEach(ctrl => {
        if (ctrl.value === event.source.value) {
          this.formPermissions.removeAt(i);
          return;
        }
        i++;
      });
    }

    if (this.permissionChecks) {
      const num = this.permissionChecks.filter(c => c.checked === true).length;
      if (num > 0 && num < this.permissionChecks.length) {
        this.checkedStatus = 'some';
      } else if (num === this.permissionChecks.length) {
        this.checkedStatus = 'all';
      } else {
        this.checkedStatus = 'none';
      }
    }
  }

  get formPermissions(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  get name(): FormControl {
    return this.roleForm.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.roleForm.get('description') as FormControl;
  }

  setCheckedAll(isChecked: boolean): void {
    if (isChecked) {
      this.checkedStatus = 'all';
    } else {
      this.checkedStatus = 'none';
    }
    this.permissionChecks?.forEach(check => check.checked = isChecked);
    this.formPermissions.clear();
    if (isChecked === true) {
      this.permissionChecks?.forEach(permCheck => this.formPermissions.push(new FormControl(permCheck.permName)));
    }
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.loadingStatus = true;

      const role: UserRole = {
        id: 0,
        name: this.name.value,
        description: this.description.value,
        permissions: this.formPermissions.value
      };

      if (this.operationType === 'add') {
        this.roleService.addNew(role)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.loadingStatus = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 3000 });
            },
            () => {
              this.loadingStatus = false;
              this.setCheckedAll(false);
              this.roleForm.reset();
              this.roleForm.markAsUntouched();
              this.roleForm.markAsPristine();
              this.formPermissions.clear();
              this.requestRefresh.emit('REQUEST_REFRESH');
              this.form.resetForm();
            });
      } else {
        this.roleService.editRole(this.initialRoleForEditName, role)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.loadingStatus = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 3000 });
            },
            () => {
              this.loadingStatus = false;
              this.setCheckedAll(false);
              this.roleForm.reset();
              this.roleForm.markAsUntouched();
              this.roleForm.markAsPristine();
              this.formPermissions.clear();
              this.requestRefresh.emit('REQUEST_REFRESH');
              this.form.resetForm();
              this.initialRoleForEditName = '';
            });
      }
    }
  }

  getFieldError(control: FormControl): string {
    if (control.hasError('required')) {
      return 'Campul este obligatoriu!';
    } else if (control.hasError('minlength')) {
      return 'Campul nu contine numarul minim de caractere!';
    } else if (control.hasError('pattern')) {
      return 'Campul nu respecta formatul cerut!';
    } else if (control.hasError('nameAlreadyTaken')) {
      return 'Numele de rol exista deja in baza de date!';
    } else {
      return 'Eroare necunoscuta';
    }
  }

  roleNameTakenValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control && control.value) {
        if (this.operationType === 'edit' && control.value === this.initialRoleForEditName) {
          return null;
        }

        if (this.usedRoleNames.includes(control.value)) {
          return { nameAlreadyTaken: true };
        }
      }
      return null;
    };
  }

}
