import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditSkillsPage } from './edit-skills.page';
import { EditSkillsPageRoutingModule } from './edit-skills-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditSkillsPageRoutingModule
  ],
  declarations: [EditSkillsPage]
})
export class EditSkillsPageModule { } 