import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from './../../../models/user';
import { UserService } from './../../../services/user.service';
import { FormBuilder, Validators, AbstractControl, FormControl, NgForm } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @ViewChild('form', { static: false }) form!: NgForm;
  @Input() operation: 'add' | 'edit' = 'add';
  roleNames: string[] = [];
  selectedRole = '';
  loadingStatus = false;
  @Output() requestRefresh = new EventEmitter<string>();
  initialUserForEditUsername = '';

  userForm = this.fb.group({
    firstName: ['', { validators: Validators.required, updateOn: 'blur' }],
    lastName: ['', { validators: Validators.required, updateOn: 'blur' }],
    username: ['', { validators: Validators.required, updateOn: 'blur' }],
    password: ['', { validators: Validators.required, updateOn: 'blur' }],
    role: ['', { validators: Validators.required, updateOn: 'blur' }],
    email: ['', { validators: Validators.required, updateOn: 'blur' }],
    locked: [false],
    activated: [false]
  });

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  set roles(names: string[]) {
    names.forEach(name => this.roleNames.push(name));
  }

  getInputError(control: FormControl): string {
    if (control.hasError('required')) {
      return 'Campul este obligatoriu!';
    } else {
      return 'Eroare necunoscuta!';
    }
  }

  get firstName(): FormControl {
    return this.userForm.get('firstName') as FormControl;
  }

  get lastName(): FormControl {
    return this.userForm.get('lastName') as FormControl;
  }

  get username(): FormControl {
    return this.userForm.get('username') as FormControl;
  }

  get email(): FormControl {
    return this.userForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.userForm.get('password') as FormControl;
  }

  get activated(): FormControl {
    return this.userForm.get('activated') as FormControl;
  }

  get locked(): FormControl {
    return this.userForm.get('locked') as FormControl;
  }

  get role_c(): FormControl {
    return this.userForm.get('role') as FormControl;
  }

  onSubmit(): void {

    if (this.userForm.valid) {
      this.loadingStatus = true;

      const user: User = {
        id: 0,
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        username: this.username.value,
        password: this.password.value,
        email: this.email.value,
        role: this.role_c.value,
        activated: this.activated.value,
        locked: this.locked.value,
        addresses: [],
        phoneNumbers: []
      };

      if (this.operation === 'add') {
        this.userService.registerNewUser(user)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.loadingStatus = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 8000 });
            },
            () => {
              this.loadingStatus = false;
              this.userForm.reset();
              this.userForm.markAsUntouched();
              this.userForm.markAsPristine();
              this.requestRefresh.emit('REQUEST_REFRESH');
              this.form.resetForm();
            });
      } else {
        this.userService.editUser(this.initialUserForEditUsername, user)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.loadingStatus = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 3000 });
            },
            () => {
              this.loadingStatus = false;
              this.userForm.reset();
              this.userForm.markAsUntouched();
              this.userForm.markAsPristine();
              this.requestRefresh.emit('REQUEST_REFRESH');
              this.form.resetForm();
              this.initialUserForEditUsername = '';
            });
      }
    }
  }

  setEditData(user: User): void {
    this.initialUserForEditUsername = user.username;
    this.form.resetForm();
    this.firstName.setValue(user.firstName);
    this.lastName.setValue(user.lastName);
    this.username.setValue(user.username);
    this.email.setValue(user.email);
    this.password.setValue('');
    this.role_c.setValue(user.role);
    this.activated.setValue(user.activated);
    this.locked.setValue(user.locked);
  }

}
