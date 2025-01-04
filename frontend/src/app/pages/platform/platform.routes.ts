import { Routes } from '@angular/router';
import { PlatformPage } from './platform.page';

export const PLATFORM_ROUTES: Routes = [
  {
    path: '',
    component: PlatformPage,
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
        path: 'businesses',
        loadComponent: () => import('./businesses/businesses.page').then(m => m.BusinessesPage)
      },
      {
        path: 'workers',
        loadComponent: () => import('./workers/workers.page').then(m => m.WorkersPage)
      },
      {
        path: 'shifts',
        loadComponent: () => import('./shifts/shifts.page').then(m => m.ShiftsPage)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.page').then(m => m.AnalyticsPage)
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing.page').then(m => m.BillingPage)
      },
      {
        path: 'support',
        loadComponent: () => import('./support/support.page').then(m => m.SupportPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage)
      }
    ]
  }
];