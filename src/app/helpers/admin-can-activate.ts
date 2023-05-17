import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCanActivate implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      const authorities = this.authService.getAuthorities();
      if (authorities) {
        const requiredAuthorities: string[] = route.data.requiredAuthorities;
        if (!requiredAuthorities) {
          return true;
        }
        if (this.authoritiesIncludeRequired(authorities, requiredAuthorities)) {
          return true;
        }
      }
    }

    this.router.navigateByUrl('/');
    return false;
  }

  private authoritiesIncludeRequired(authorities: string[], requiredAuthorities: string[]): boolean {
    for (const required of requiredAuthorities) {
      if (!authorities.includes(required)) {
        return false;
      }
    }
    return true;
  }

}
