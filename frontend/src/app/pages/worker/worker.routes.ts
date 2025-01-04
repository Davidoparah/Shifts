import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./worker.page').then(m => m.WorkerPage)
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },
  {
    path: 'edit-skills',
    loadComponent: () => import('./edit-skills/edit-skills.page').then(m => m.EditSkillsPage)
  },
  {
    path: 'edit-availability',
    loadComponent: () => import('./edit-availability/edit-availability.page').then(m => m.EditAvailabilityPage)
  }
]; 