import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.routes)
  },
  {
    path: 'worker',
    loadChildren: () => import('./pages/worker/worker.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'business-owner',
    loadChildren: () => import('./pages/business-owner/business-owner.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.routes),
    canActivate: [AuthGuard]
  }
];
