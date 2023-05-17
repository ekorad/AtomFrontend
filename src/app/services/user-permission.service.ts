import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserPermission } from '../models/user-permission';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>('http://localhost:8080/users/permissions');
  }
}
