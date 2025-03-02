import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'worker') {
        return true;
      }
      // If authenticated but not a worker, redirect to appropriate dashboard
      this.router.navigate([`/${user?.role}/dashboard`]);
      return false;
    }
    
    // Not authenticated, redirect to login
    this.router.navigate(['/auth/login']);
    return false;
  }
} 