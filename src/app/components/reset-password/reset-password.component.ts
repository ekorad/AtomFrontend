import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './../../services/user.service';
import { MatSelectChange } from '@angular/material/select';
import { FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  readonly title = 'Resetare parola';
  resetPasswordForm = this.fb.group({
    resetMethod: ['', { validators: Validators.required, updateOn: 'blur' }],
    username: ['', { updateOn: 'blur' }],
    email: ['', { updateOn: 'blur' }]
  });
  private readonly observer: Observer<unknown> = {
    next: stuff => { },
    error: err => {
      console.log(err);
      this.isLoading = false;
      this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
        'Inchide', { duration: 8000 });
      this.matForm.resetForm();
    },
    complete: () => {
      this.isLoading = false;
      this.snackBar.open('Link-ul a fost trimis. Te rugam sa iti verifici inbox-ul.',
        'Inchide', { duration: 8000 });
      this.matForm.resetForm();
    }
  };

  readonly resetMethods: { method: 'username' | 'email', caption: string }[] = [
    { method: 'username', caption: 'Dupa numele de utilzator' },
    { method: 'email', caption: 'Dupa adresa de e-mail' }
  ];
  private readonly usernameValidators = [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)];
  private readonly emailValidators = [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)];
  isLoading = false;
  @ViewChild('form', { static: false }) matForm!: NgForm;

  constructor(private titleService: Title,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private fb: FormBuilder,
              private userService: UserService,
              private snackBar: MatSnackBar) {
    this.titleService.setTitle(this.title);
    this.matIconRegistry.addSvgIcon(
      'atom',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/img/atom.svg')
    );
  }

  ngOnInit(): void {
  }

  get resetMethod(): FormControl {
    return this.resetPasswordForm.get('resetMethod') as FormControl;
  }

  get username(): FormControl {
    return this.resetPasswordForm.get('username') as FormControl;
  }

  get email(): FormControl {
    return this.resetPasswordForm.get('email') as FormControl;
  }

  get selectedResetMethod(): 'username' | 'email' | null {
    const value = this.resetMethod.value;
    if (value) {
      return value.method;
    }
    return null;
  }

  onResetMethodSelected(event: MatSelectChange): void {
    if (event.value.method === 'username') {
      this.username.setValidators(this.usernameValidators);
      this.email.clearValidators();
    } else if (event.value.method === 'email') {
      this.email.setValidators(this.emailValidators);
      this.username.clearValidators();
    }
  }

  getControlError(control: FormControl): string {
    if (control.hasError('required')) {
      return 'Campul este obligatoriu!';
    } else if (control === this.username && control.hasError('pattern')) {
      return 'Valoarea introdusa contine caractere invalide!';
    } else if (control === this.email && control.hasError('pattern')) {
      return 'Valoarea introdusa are un format incorect!';
    } else {
      return 'Eroare necunoscuta!';
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.resetMethod.value.method === 'username') {
      this.userService.requestPassResetByUsename(this.username.value)
        .subscribe(this.observer);
    } else if (this.resetMethod.value.method === 'email') {
      this.userService.requestPassResetByEmail(this.email.value)
        .subscribe(this.observer);
    }
  }

}
