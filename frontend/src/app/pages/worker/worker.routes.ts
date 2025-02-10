import { Routes } from '@angular/router';
import { WorkerPage } from './worker.page';
import { AvailableShiftsPage } from './shifts/available-shifts.page';
import { MyShiftsPage } from './shifts/my-shifts.page';
import { ShiftDetailsPage } from './shifts/shift-details.page';
import { EarningsPage } from './earnings/earnings.page';

export const routes: Routes = [
  {
    path: '',
    component: WorkerPage,
    children: [
      {
        path: '',
        redirectTo: 'available-shifts',
        pathMatch: 'full'
      },
      {
        path: 'available-shifts',
        component: AvailableShiftsPage
      },
      {
        path: 'my-shifts',
        component: MyShiftsPage
      },
      {
        path: 'shifts/details/:id',
        component: ShiftDetailsPage
      },
      {
        path: 'earnings',
        component: EarningsPage
      },
      {
        path: 'incidents',
        loadChildren: () => import('./incidents/incidents.routes').then(m => m.routes)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then(m => m.routes)
      },
      // Temporarily comment out routes until components are implemented
      /*
      {
        path: 'chat',
        loadChildren: () => import('./chat/chat.routes').then(m => m.routes)
      },
      {
        path: 'map',
        loadChildren: () => import('./map/map.routes').then(m => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./notifications/notifications.routes').then(m => m.routes)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then(m => m.routes)
      }
      */
    ]
  }
]; 