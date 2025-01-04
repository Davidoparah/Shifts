import { Routes } from '@angular/router';
import { PlatformOwnerPage } from './platform-owner.page';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PlatformOwnerPage,
    canActivate: [AuthGuard]
  }
]; 