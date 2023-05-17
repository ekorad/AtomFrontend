import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm = this.fb.group({
    username: ['', { validators: Validators.required, updateOn: 'blur' }],
    password: ['', { validators: Validators.required, updateOn: 'blur' }]
  });
  loginLoading = false;

  constructor(private title: Title,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private snackbar: MatSnackBar) {
    this.title.setTitle('Conectare');
    this.matIconRegistry.addSvgIcon(
      'atom',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/img/atom.svg')
    );
  }

  ngOnInit(): void {
  }

  get username(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  onSubmit(): void {
    this.loginLoading = true;
    this.authService.authenticate(this.username.value, this.password.value)
      .subscribe(
        jwt => { },
        err => {
          const error = err as HttpErrorResponse;
          this.loginLoading = false;
          if (error.status === 401) {
            this.snackbar.open('Datele introduse sunt incorecte',
              'Inchide', { duration: 3000 });
            this.loginForm.reset();
            this.loginForm.markAsPristine();
            this.username.setErrors({ invalidCreds: true });
            this.password.setErrors({ invalidCreds: true });
          }
        },
        () => {
          this.loginLoading = false;
          this.router.navigateByUrl('/');
        }
      );
  }
}
