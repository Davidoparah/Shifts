import { Routes } from '@angular/router';
import { BusinessOwnerPage } from './business-owner.page';
import { ShiftsListPage } from './shifts/shifts-list.page';
import { ShiftDetailsPage } from './shifts/shift-details.page';
import { AuthGuard } from '../../guards/auth.guard';
import { roleGuard } from '../../guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: BusinessOwnerPage,
    canActivate: [AuthGuard],
    canMatch: [roleGuard],
    data: { role: 'business_owner' },
    children: [
      {
        path: '',
        redirectTo: 'shifts',
        pathMatch: 'full'
      },
      {
        path: 'shifts',
        children: [
          {
            path: '',
            loadComponent: () => import('./shifts/shifts-list.page').then(m => m.ShiftsListPage)
          },
          {
            path: 'create',
            loadComponent: () => import('./shifts/create-shift.page').then(m => m.CreateShiftPage)
          },
          {
            path: ':id',
            component: ShiftDetailsPage
          }
        ]
      }
    ]
  }
]; 