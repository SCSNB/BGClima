import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('AuthGuard#canActivate called');
    console.log('Is authenticated:', this.authService.isAuthenticated());
    
    if (this.authService.isAuthenticated()) {
      // Check if route has data.roles and user has one of required roles
      if (route.data['roles'] && !this.checkRoles(route.data['roles'])) {
        console.log('User does not have required role');
        // User doesn't have required role, redirect to login page
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }

      console.log('User is authenticated and authorized');
      // Authenticated and authorized
      return true;
    }

    console.log('User is not authenticated, redirecting to login');
    // Not logged in, redirect to login page with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  private checkRoles(roles: string[]): boolean {
    console.log('Checking roles:', roles);
    console.log('User roles:', this.authService.currentUserValue?.roles);
    
    for (const role of roles) {
      if (this.authService.hasRole(role)) {
        return true;
      }
    }
    return false;
  }
} 