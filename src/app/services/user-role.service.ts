import { HttpClient, HttpParams } from '@angular/common/http';
import { UserRole } from './../models/user-role';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>('http://localhost:8080/users/roles');
  }

  addNew(role: UserRole): Observable<unknown> {
    return this.http.post('http://localhost:8080/users/roles/add', role);
  }

  editRole(roleName: string, role: UserRole): Observable<unknown> {
    const options = {
      params: new HttpParams().set('name', roleName)
    };
    return this.http.put('http://localhost:8080/users/roles/update', role, options);
  }

  deleteRoles(roleNames: string[]): Observable<unknown> {
    const namesStr = roleNames.join(',');
    const options = {
      params: new HttpParams().set('names', namesStr)
    };
    return this.http.delete('http://localhost:8080/users/roles/remove', options);
  }

}
