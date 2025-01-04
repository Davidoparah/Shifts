import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then(m => m.HomePage)
      },
      {
        path: 'shifts',
        loadComponent: () =>
          import('../shifts/shifts.page').then(m => m.ShiftsPage)
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('../schedule/schedule.page').then(m => m.SchedulePage)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  }
]; 