import { Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.page').then(m => m.UsersPage)
      },
      {
        path: 'businesses',
        loadComponent: () => import('./businesses/businesses.page').then(m => m.BusinessesPage)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.page').then(m => m.AnalyticsPage)
      }
    ]
  }
]; 