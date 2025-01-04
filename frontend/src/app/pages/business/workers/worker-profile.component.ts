import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Worker, WorkerService, WorkerProfile, WorkerProfileUpdate, WorkerAvailability } from '../../../services/worker.service';

interface WorkerFormData extends WorkerProfileUpdate {
  id: string;
  is_active: boolean;
  avatar?: string;
  availability: WorkerAvailability;
}

interface Location {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
}

@Component({
  selector: 'app-worker-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Worker Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="saveProfile()" [disabled]="!hasChanges">
            <ion-icon name="save-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Profile Header -->
      <div class="profile-header">
        <ion-avatar class="large-avatar">
          <img [src]="workerData.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
        </ion-avatar>
        <ion-button fill="clear" (click)="updateAvatar()">
          <ion-icon slot="start" name="camera"></ion-icon>
          Change Photo
        </ion-button>
      </div>

      <!-- Basic Information -->
      <ion-list>
        <ion-list-header>
          <ion-label>Basic Information</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="stacked">Name</ion-label>
          <ion-input [(ngModel)]="workerData.name" (ionChange)="checkChanges()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input [(ngModel)]="workerData.email" type="email" (ionChange)="checkChanges()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phone</ion-label>
          <ion-input [(ngModel)]="workerData.phone" type="tel" (ionChange)="checkChanges()"></ion-input>
        </ion-item>
      </ion-list>

      <!-- Work Information -->
      <ion-list>
        <ion-list-header>
          <ion-label>Work Information</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="stacked">Preferred Work Hours</ion-label>
          <ion-select [(ngModel)]="workerData.preferred_hours" multiple="true" (ionChange)="checkChanges()">
            <ion-select-option value="morning">Morning (6 AM - 12 PM)</ion-select-option>
            <ion-select-option value="afternoon">Afternoon (12 PM - 6 PM)</ion-select-option>
            <ion-select-option value="evening">Evening (6 PM - 12 AM)</ion-select-option>
            <ion-select-option value="night">Night (12 AM - 6 AM)</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Maximum Weekly Hours</ion-label>
          <ion-input [(ngModel)]="workerData.max_weekly_hours" 
                     type="number" 
                     min="0" 
                     max="168"
                     (ionChange)="checkChanges()"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Preferred Locations</ion-label>
          <ion-select [(ngModel)]="workerData.preferred_locations" multiple="true" (ionChange)="checkChanges()">
            <ion-select-option *ngFor="let location of availableLocations" [value]="location.id">
              {{ location.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Skills & Certifications</ion-label>
          <ion-select [(ngModel)]="workerData.skills" multiple="true" (ionChange)="checkChanges()">
            <ion-select-option *ngFor="let skill of availableSkills" [value]="skill.id">
              {{ skill.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <!-- Availability -->
      <ion-list>
        <ion-list-header>
          <ion-label>Weekly Availability</ion-label>
        </ion-list-header>

        <ion-item *ngFor="let day of weekDays">
          <ion-label>{{ day }}</ion-label>
          <ion-toggle [ngModel]="getAvailability(day)" 
                     (ngModelChange)="updateAvailability(day, $event)"
                     (ionChange)="checkChanges()"></ion-toggle>
        </ion-item>
      </ion-list>

      <!-- Notes -->
      <ion-list>
        <ion-list-header>
          <ion-label>Additional Notes</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-textarea [(ngModel)]="workerData.notes" 
                       rows="4" 
                       placeholder="Add any additional notes about this worker..."
                       (ionChange)="checkChanges()"></ion-textarea>
        </ion-item>
      </ion-list>

      <!-- Status -->
      <ion-list>
        <ion-list-header>
          <ion-label>Account Status</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>Active Status</ion-label>
          <ion-toggle [(ngModel)]="workerData.is_active" 
                     (ionChange)="updateStatus($event)"></ion-toggle>
        </ion-item>
      </ion-list>

      <!-- Danger Zone -->
      <ion-list class="ion-margin-top">
        <ion-list-header color="danger">
          <ion-label>Danger Zone</ion-label>
        </ion-list-header>

        <ion-item button (click)="confirmDeactivate()" color="danger" lines="none">
          <ion-icon slot="start" name="warning-outline"></ion-icon>
          <ion-label>Deactivate Account</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    .large-avatar {
      width: 120px;
      height: 120px;
      margin-bottom: 16px;
    }

    ion-list-header {
      margin-top: 16px;
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    ion-item {
      --padding-start: 0;
    }

    @media (prefers-color-scheme: dark) {
      ion-list-header {
        --color: var(--ion-color-light);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WorkerProfileComponent implements OnInit {
  worker: Worker;
  workerData: WorkerFormData = {
    id: '',
    name: '',
    email: '',
    preferred_hours: [],
    preferred_locations: [],
    skills: [],
    max_weekly_hours: 40,
    availability: this.initializeAvailability(),
    notes: '',
    is_active: true
  };
  originalData: WorkerFormData;
  hasChanges: boolean = false;
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  availableLocations: Location[] = [];
  availableSkills: Skill[] = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private workerService: WorkerService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.worker = this.navParams.get('worker');
    this.originalData = { ...this.workerData };
  }

  ngOnInit() {
    this.loadWorkerData();
    this.loadAvailableLocations();
    this.loadAvailableSkills();
  }

  async loadWorkerData() {
    try {
      const details = await this.workerService.getWorkerDetails(this.worker.id).toPromise();
      if (details) {
        this.workerData = {
          id: details.id,
          name: details.name,
          email: details.email,
          phone: details.phone || '',
          avatar: details.avatar,
          availability: details.availability || this.initializeAvailability(),
          preferred_hours: details.preferred_hours || [],
          preferred_locations: details.preferred_locations || [],
          skills: details.skills || [],
          max_weekly_hours: details.max_weekly_hours || 40,
          is_active: details.status === 'active',
          notes: details.notes || ''
        };
        this.originalData = { ...this.workerData };
      }
    } catch (error) {
      console.error('Error loading worker details:', error);
      const toast = await this.toastController.create({
        message: 'Failed to load worker details',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private initializeAvailability(): WorkerAvailability {
    return {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    };
  }

  updateAvailability(day: string, value: boolean) {
    if (this.workerData.availability) {
      this.workerData.availability[day.toLowerCase() as keyof WorkerAvailability] = value;
      this.checkChanges();
    }
  }

  async loadAvailableLocations() {
    try {
      const locations = await this.workerService.getAvailableLocations().toPromise();
      this.availableLocations = locations || [];
    } catch (error) {
      console.error('Error loading locations:', error);
      const toast = await this.toastController.create({
        message: 'Failed to load locations',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async loadAvailableSkills() {
    try {
      const skills = await this.workerService.getAvailableSkills().toPromise();
      this.availableSkills = skills || [];
    } catch (error) {
      console.error('Error loading skills:', error);
      const toast = await this.toastController.create({
        message: 'Failed to load skills',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  checkChanges() {
    this.hasChanges = JSON.stringify(this.workerData) !== JSON.stringify(this.originalData);
  }

  async updateAvatar() {
    const alert = await this.alertController.create({
      header: 'Update Avatar',
      message: 'Avatar update feature coming soon!',
      buttons: ['OK']
    });
    await alert.present();
  }

  async updateStatus(event: any) {
    const newStatus = event.detail.checked;
    try {
      await this.workerService.updateWorkerStatus(
        this.worker.id,
        newStatus ? 'active' : 'inactive'
      ).toPromise();

      const toast = await this.toastController.create({
        message: `Worker status ${newStatus ? 'activated' : 'deactivated'}`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error updating worker status:', error);
      const toast = await this.toastController.create({
        message: 'Failed to update worker status',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      // Revert the toggle
      this.workerData.is_active = !newStatus;
    }
  }

  async confirmDeactivate() {
    const alert = await this.alertController.create({
      header: 'Confirm Deactivation',
      message: 'Are you sure you want to deactivate this worker? They will no longer be able to access the platform.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Deactivate',
          role: 'destructive',
          handler: () => {
            this.deactivateWorker();
          }
        }
      ]
    });
    await alert.present();
  }

  async deactivateWorker() {
    try {
      await this.workerService.updateWorkerStatus(this.worker.id, 'inactive').toPromise();
      this.workerData.is_active = false;
      const toast = await this.toastController.create({
        message: 'Worker account deactivated',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.dismiss();
    } catch (error) {
      console.error('Error deactivating worker:', error);
      const toast = await this.toastController.create({
        message: 'Failed to deactivate worker',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async saveProfile() {
    try {
      const profileUpdate: WorkerProfileUpdate = {
        name: this.workerData.name,
        email: this.workerData.email,
        phone: this.workerData.phone,
        preferred_hours: this.workerData.preferred_hours,
        preferred_locations: this.workerData.preferred_locations,
        skills: this.workerData.skills,
        max_weekly_hours: this.workerData.max_weekly_hours,
        availability: this.workerData.availability,
        notes: this.workerData.notes
      };

      await this.workerService.updateWorkerProfile(this.worker.id, profileUpdate).toPromise();
      this.originalData = { ...this.workerData };
      this.hasChanges = false;
      
      const toast = await this.toastController.create({
        message: 'Worker profile updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error saving worker profile:', error);
      const toast = await this.toastController.create({
        message: 'Failed to save worker profile',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      updated: this.hasChanges
    });
  }

  getAvailability(day: string): boolean {
    const key = day.toLowerCase() as keyof WorkerAvailability;
    return this.workerData.availability[key];
  }
} 