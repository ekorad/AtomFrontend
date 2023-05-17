import { Router } from '@angular/router';
import { User } from './../../models/user';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  profileForm = this.fb.group({
    firstName: ['', { validators: Validators.required, updateOn: 'blur' }],
    lastName: ['', { validators: Validators.required, updateOn: 'blur' }],
    username: ['', { validators: [Validators.required, Validators.minLength(5), Validators.pattern(/^[a-zA-Z0-9_]+$/)], asyncValidators: [this.isUsernameTaken()], updateOn: 'blur' }],
    email: ['', { validators: [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)], asyncValidators: [this.isEmailTaken()], updateOn: 'blur' }],
    password: ['', { validators: [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_])[a-zA-Z0-9!@#$%^&*_]+$/)], updateOn: 'blur' }]
  });
  registerLoading = false;

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private titleService: Title,
              private fb: FormBuilder,
              private userService: UserService,
              private router: Router) {
    this.titleService.setTitle('Inregistrare cont');
    this.matIconRegistry.addSvgIcon(
      'atom',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/img/atom.svg')
    );
  }

  getFieldError(control: FormControl): string {
    if (control.hasError('required')) {
      return 'Campul este obligatoriu!';
    } else if (control.hasError('minlength')) {
      return 'Campul nu contine numarul minim de caractere!';
    } else if (control.hasError('pattern')) {
      return 'Campul nu respecta formatul cerut!';
    } else if (control.hasError('usernameTaken')) {
      return 'Numele de utilizator exista deja in baza de date!';
    } else if (control.hasError('emailTaken')) {
      return 'Adresa de email exista deja in baza de date!';
    } else {
      return 'Eroare necunoscuta';
    }
  }

  ngOnInit(): void {
  }

  isUsernameTaken(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.userService.checkUsernameExists(control.value)
        .pipe(
          map(result => result ? { usernameTaken: true } : null)
        );
    };
  }

  isEmailTaken(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.userService.checkEmailExists(control.value)
        .pipe(
          map(result => result ? { emailTaken: true } : null)
        );
    };
  }

  get lastName(): FormControl {
    return this.profileForm.get('lastName') as FormControl;
  }

  get firstName(): FormControl {
    return this.profileForm.get('firstName') as FormControl;
  }

  get username(): FormControl {
    return this.profileForm.get('username') as FormControl;
  }

  get email(): FormControl {
    return this.profileForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.profileForm.get('password') as FormControl;
  }

  onSubmit(): void {
    const user: User = {
      id: 0,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      username: this.username.value,
      email: this.email.value,
      password: this.password.value,
      role: 'USER',
      activated: false,
      locked: false,
      addresses: [],
      phoneNumbers: []
    };

    this.registerLoading = true;
    this.userService.registerNewUser(user).subscribe(
      something => console.log(something),
      err => {
        this.registerLoading = false;
        this.profileForm.reset();
        this.profileForm.markAsPristine();
      },
      () => {
        this.registerLoading = false;
        this.router.navigateByUrl('/login');
      }
    );
  }
}
