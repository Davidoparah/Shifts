import { Routes } from '@angular/router';
import { IncidentsListPage } from './incidents-list/incidents-list.page';
import { IncidentReportPage } from './incident-report/incident-report.page';

export const routes: Routes = [
  {
    path: '',
    component: IncidentsListPage
  },
  {
    path: 'report',
    component: IncidentReportPage
  }
]; 