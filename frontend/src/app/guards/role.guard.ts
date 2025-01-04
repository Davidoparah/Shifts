import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  
  const user = authService.getCurrentUser();
  if (!user || user.role !== expectedRole) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  return true;
}; 