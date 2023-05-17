import { AuthService } from './auth.service';
import { User } from './../models/user';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  checkUsernameExists(username: string): Observable<boolean> {
    const getParams = new HttpParams().set('username', username);
    return this.http.get<boolean>('http://localhost:8080/users/check', { params: getParams });
  }

  checkEmailExists(email: string): Observable<boolean> {
    const getParams = new HttpParams().set('email', email);
    return this.http.get<boolean>('http://localhost:8080/users/check', { params: getParams });
  }

  registerNewUser(user: User): Observable<unknown> {
    return this.http.post('http://localhost:8080/users/add', user);
  }

  editUser(username: string, user: User): Observable<unknown> {
    const options = {
      params: new HttpParams().set('username', username)
    };
    return this.http.put('http://localhost:8080/users/update', user, options);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8080/users');
  }

  deleteUsers(usernames: string[]): Observable<unknown> {
    const usernamesStr = usernames.join(',');
    const options = {
      params: new HttpParams().set('usernames', usernamesStr)
    };
    return this.http.delete('http://localhost:8080/users/remove', options);
  }

  getCurrentUser(): Observable<User> {
    const username = this.authService.getUsername();
    if (username) {
      const options = {
        params: new HttpParams().set('username', username)
      };
      return this.http.get<User>('http://localhost:8080/users', options);
    }
    return new Observable<User>(subscriber => {
      subscriber.error('No user currently logged in');
    });
  }

  requestPassResetByUsename(username: string): Observable<unknown> {
    const params = new HttpParams().set('username', username);
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.http.post('http://localhost:8080/users/pass-reset-request', params, options);
  }

  requestPassResetByEmail(email: string): Observable<unknown> {
    const params = new HttpParams().set('email', email);
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.http.post('http://localhost:8080/users/pass-reset-request', params, options);
  }

}

