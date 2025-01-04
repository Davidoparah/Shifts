import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditAvailabilityPage } from './edit-availability.page';
import { EditAvailabilityPageRoutingModule } from './edit-availability-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditAvailabilityPageRoutingModule
  ],
  declarations: [EditAvailabilityPage]
})
export class EditAvailabilityPageModule { } 