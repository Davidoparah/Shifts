import { Routes } from '@angular/router';
import { BusinessPage } from './business.page';

export const BUSINESS_ROUTES: Routes = [
  {
    path: '',
    component: BusinessPage,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'shifts',
        loadComponent: () => import('./shifts/shifts.page')
          .then(m => m.ShiftsPage)
      },
      {
        path: 'shifts/create',
        loadComponent: () => import('./shifts/create-shift.component')
          .then(m => m.CreateShiftComponent)
      },
      {
        path: 'workers',
        loadComponent: () => import('./workers/workers.page')
          .then(m => m.WorkersPage)
      },
      {
        path: 'applications',
        loadComponent: () => import('./applications/applications.page')
          .then(m => m.ApplicationsPage)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.page')
          .then(m => m.ReportsPage)
      }
    ]
  }
];