import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  if (!requiredRole) {
    console.warn('No role specified in route data');
    return true;
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    console.warn('No user found, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  if (!currentUser.role) {
    console.warn('User has no role defined');
    router.navigate(['/auth/login']);
    return false;
  }

  const hasRole = currentUser.role.toLowerCase() === requiredRole.toLowerCase();
  if (!hasRole) {
    console.warn('Access denied. Required role:', requiredRole, 'Current role:', currentUser.role);
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
}; 