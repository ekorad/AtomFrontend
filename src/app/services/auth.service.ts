import { JwtPayloadExtension } from './../helpers/jwt-payload-extension';
import jwt_decode from 'jwt-decode';
import { Token } from './../models/token';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public authenticate(username: string, password: string): Observable<Token> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.http.post<Token>('http://localhost:8080/users/authenticate',
      params, options).pipe(tap(token => this.setSession(token)));
  }

  private setSession(token: Token): void {
    const expiresAt = new Date(Date.now() + token.expiry);
    localStorage.setItem('jwt', token.jwt);
    localStorage.setItem('jwt_expires_at', JSON.stringify(expiresAt.valueOf()));
  }

  public logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('jwt_expires_at');
  }

  public isLoggedIn(): boolean {
    if (!this.isTokenValid()) {
      this.logout();
      return false;
    }
    return true;
  }

  public getExpiration(): Date | null {
    const expiration = localStorage.getItem('jwt_expires_at');
    if (!expiration) {
      return null;
    }
    const expiresAt = JSON.parse(expiration);
    return new Date(expiresAt);
  }

  public retrieveToken(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const jwt = localStorage.getItem('jwt');
    return jwt;
  }

  private isTokenValid(): boolean {
    const now = new Date(Date.now());
    const exp = this.getExpiration();

    if (!exp) {
      return false;
    }

    return exp > now;
  }

  getAuthorities(): string[] | null {
    const jwt = this.retrieveToken();
    if (jwt) {
      const decoded = jwt_decode<JwtPayloadExtension>(jwt);
      const authorities = decoded.authorities?.split(', ');
      if (authorities) {
        return authorities;
      }
    }
    return null;
  }

  getUsername(): string | null {
    const jwt = this.retrieveToken();
    if (jwt) {
      const decoded = jwt_decode<JwtPayloadExtension>(jwt);
      const username = decoded.sub;
      if (username) {
        return username;
      }
    }
    return null;
  }

  hasElevated(): boolean {
    const authorities = this.getAuthorities();
    if (authorities) {
      if (authorities.includes('ELEVATED')) {
        return true;
      }
    }
    return false;
  }
}
