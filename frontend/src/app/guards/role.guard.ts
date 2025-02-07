import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

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

  // Normalize roles for comparison
  const normalizedUserRole = currentUser.role.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const normalizedRequiredRole = requiredRole.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  console.log('Role check:', {
    userRole: currentUser.role,
    normalizedUserRole,
    requiredRole,
    normalizedRequiredRole
  });

  const hasRole = normalizedUserRole === normalizedRequiredRole;
  if (!hasRole) {
    console.warn('Access denied. Required role:', requiredRole, 'Current role:', currentUser.role);
    
    // Redirect based on user's actual role
    switch (normalizedUserRole) {
      case 'admin':
        router.navigate(['/admin/dashboard']);
        break;
      case 'business_owner':
        router.navigate(['/business-owner/shifts']);
        break;
      case 'worker':
        router.navigate(['/worker/available-shifts']);
        break;
      default:
        router.navigate(['/auth/login']);
    }
    return false;
  }

  return true;
}; 