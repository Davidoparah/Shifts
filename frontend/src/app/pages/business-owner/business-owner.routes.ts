import { Routes } from '@angular/router';
import { BusinessOwnerPage } from './business-owner.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: BusinessOwnerPage,
    canActivate: [AuthGuard]
  },
  {
    path: 'create-shift',
    loadComponent: () => import('./create-shift/create-shift.page').then(m => m.CreateShiftPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-shift/:id',
    loadComponent: () => import('./edit-shift/edit-shift.page').then(m => m.EditShiftPage),
    canActivate: [AuthGuard]
  }
]; 