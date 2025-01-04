import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlatformOwnerPage } from './platform-owner.page';
import { PlatformOwnerPageRoutingModule } from './platform-owner-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlatformOwnerPageRoutingModule
  ],
  declarations: [PlatformOwnerPage]
})
export class PlatformOwnerPageModule { } 