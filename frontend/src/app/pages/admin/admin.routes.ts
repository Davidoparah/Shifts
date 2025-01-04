import { Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    canActivate: [AuthGuard]
  }
]; 