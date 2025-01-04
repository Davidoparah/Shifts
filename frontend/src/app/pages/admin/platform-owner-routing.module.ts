import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlatformOwnerPage } from './platform-owner.page';

const routes: Routes = [
  {
    path: '',
    component: PlatformOwnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatformOwnerPageRoutingModule { } 