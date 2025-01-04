import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BusinessOwnerPage } from './business-owner.page';
import { BusinessOwnerPageRoutingModule } from './business-owner-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BusinessOwnerPageRoutingModule
  ],
  declarations: [BusinessOwnerPage]
})
export class BusinessOwnerPageModule { } 