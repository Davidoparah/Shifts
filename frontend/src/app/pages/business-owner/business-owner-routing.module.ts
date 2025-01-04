import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessOwnerPage } from './business-owner.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessOwnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessOwnerPageRoutingModule { } 