import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditAvailabilityPage } from './edit-availability.page';

const routes: Routes = [
  {
    path: '',
    component: EditAvailabilityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAvailabilityPageRoutingModule { } 