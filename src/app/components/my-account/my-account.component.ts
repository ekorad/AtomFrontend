import { Title } from '@angular/platform-browser';
import { FormBuilder, Validators, NgForm } from '@angular/forms';
import { User } from './../../models/user';
import { UserService } from './../../services/user.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  @ViewChild('addrForm', { static: false }) addrMatForm!: NgForm;
  @ViewChild('phoneNumForm', { static: false }) phoneNumMatForm!: NgForm;
  currentUser!: User;
  loading = false;
  addressForm = this.fb.group({
    address: ['', { validators: Validators.required }]
  });
  phoneNumberForm = this.fb.group({
    phoneNumber: ['', { validators: Validators.required }]
  });

  constructor(private userService: UserService,
    private fb: FormBuilder,
    private title: Title) {
      this.title.setTitle('Contul meu');
    }

  ngOnInit(): void {
    this.loading = true;
    this.userService.getCurrentUser()
      .subscribe(crt => this.currentUser = crt,
        err => console.log(err),
        () => {
          this.loading = false;
        });
  }

  onNewAddressSubmit(): void {
    if (this.addressForm.valid) {
      const control = this.addressForm.get('address');
      if (control) {
        this.currentUser.addresses.push(control.value);
        this.addrMatForm.resetForm();
      }
    }
  }

  onNewPhoneNumberSubmit(): void {
    if (this.phoneNumberForm.valid) {
      const control = this.phoneNumberForm.get('phoneNumber');
      if (control) {
        this.currentUser.phoneNumbers.push(control.value);
        this.phoneNumMatForm.resetForm();
      }
    }
  }

  saveProfile(): void {
    if (this.currentUser) {
      this.userService.editUser(this.currentUser.username, this.currentUser)
        .subscribe(stuff => { },
          err => console.log(err),
          () => { });
    }
  }

  onRemoveAddressClick(addr: string): void {
    const index: number = this.currentUser.addresses.indexOf(addr);
    if (index !== -1) {
      this.currentUser.addresses.splice(index, 1);
    }
  }

  onRemovePhoneNumberClick(phNum: string): void {
    const index: number = this.currentUser.phoneNumbers.indexOf(phNum);
    if (index !== -1) {
      this.currentUser.phoneNumbers.splice(index, 1);
    }
  }

}
