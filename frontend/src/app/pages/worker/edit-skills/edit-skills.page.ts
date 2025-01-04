import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

@Component({
  selector: 'app-edit-skills',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Skills</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-input
            [(ngModel)]="newSkill"
            placeholder="Add a new skill"
            (keyup.enter)="addSkill()"
          ></ion-input>
          <ion-button slot="end" (click)="addSkill()">Add</ion-button>
        </ion-item>

        <ion-item-group>
          <ion-item-divider>
            <ion-label>Current Skills</ion-label>
          </ion-item-divider>

          <ion-item *ngFor="let skill of skills">
            <ion-label>{{ skill }}</ion-label>
            <ion-button slot="end" color="danger" (click)="removeSkill(skill)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item *ngIf="skills.length === 0">
            <ion-label class="ion-text-center">
              No skills added yet. Add some skills to get started!
            </ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <ion-button expand="block" (click)="saveSkills()" class="ion-margin-top">
        Save Skills
      </ion-button>

      <ion-spinner *ngIf="isLoading" class="spinner-center"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    ion-item {
      margin-bottom: 8px;
    }
    .spinner-center {
      display: block;
      margin: auto;
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditSkillsPage implements OnInit {
  skills: string[] = [];
  newSkill = '';
  isLoading = true;

  constructor(
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        this.skills = [...profile.skills];
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load skills',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  addSkill() {
    if (this.newSkill.trim()) {
      if (!this.skills.includes(this.newSkill.trim())) {
        this.skills.push(this.newSkill.trim());
      }
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    this.skills = this.skills.filter(s => s !== skill);
  }

  async saveSkills() {
    try {
      await this.workerService.updateProfile({ skills: this.skills }).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Skills updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      this.router.navigate(['/worker']);
    } catch (error) {
      console.error('Error updating skills:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to update skills',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
} 