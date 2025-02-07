import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./chat-list/chat-list.routes').then(m => m.routes)
  },
  {
    path: 'new',
    loadChildren: () => import('./new-chat/new-chat.routes').then(m => m.routes)
  }
]; 