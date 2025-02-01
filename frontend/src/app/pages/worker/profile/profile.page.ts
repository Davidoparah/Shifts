import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="!isLoading">
        <div class="profile-header">
          <ion-avatar>
            <img src="assets/default-avatar.png" />
          </ion-avatar>
          <h2>{{ profile?.user?.first_name }} {{ profile?.user?.last_name }}</h2>
          <p>{{ profile?.user?.email }}</p>
          <ion-badge color="success">{{ profile?.rating || 0 }} ★</ion-badge>
        </div>

        <ion-list>
          <ion-item-group>
            <ion-item-divider>
              <ion-label>Personal Information</ion-label>
            </ion-item-divider>

            <ion-item>
              <ion-label position="stacked" color="primary">Phone Number</ion-label>
              <ion-input 
                type="tel" 
                [(ngModel)]="profile.phone" 
                placeholder="Enter your phone number"
                class="custom-input"
                fill="solid"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked" color="primary">Address</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="profile.address" 
                placeholder="Enter your address"
                class="custom-input"
                fill="solid"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked" color="primary">Bio</ion-label>
              <ion-textarea 
                [(ngModel)]="profile.bio" 
                rows="4" 
                placeholder="Tell us about yourself"
                class="custom-input"
                fill="solid"
              ></ion-textarea>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider>
              <ion-label>Work Preferences</ion-label>
            </ion-item-divider>

            <ion-item>
              <ion-label position="stacked" color="primary">Hourly Rate ($)</ion-label>
              <ion-input 
                type="number" 
                [(ngModel)]="profile.hourly_rate" 
                min="0" 
                placeholder="Enter your desired hourly rate"
                class="custom-input"
                fill="solid"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked" color="primary">Skills</ion-label>
              <ion-select 
                [(ngModel)]="profile.skills" 
                multiple="true" 
                placeholder="Select your skills"
                class="custom-select"
                interface="action-sheet"
                fill="solid"
              >
                <ion-select-option value="Customer Service">Customer Service</ion-select-option>
                <ion-select-option value="Food Service">Food Service</ion-select-option>
                <ion-select-option value="Retail">Retail</ion-select-option>
                <ion-select-option value="Warehouse">Warehouse</ion-select-option>
                <ion-select-option value="Cleaning">Cleaning</ion-select-option>
                <ion-select-option value="Security">Security</ion-select-option>
                <ion-select-option value="Office Work">Office Work</ion-select-option>
                <ion-select-option value="Manual Labor">Manual Labor</ion-select-option>
                <ion-select-option value="Driving">Driving</ion-select-option>
                <ion-select-option value="Sales">Sales</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-item-group>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" (click)="saveProfile()" color="primary">
            Save Changes
          </ion-button>
        </div>
      </div>

      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>Loading profile...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      padding: 32px 16px;
      text-align: center;
      background: var(--ion-color-light);
    }

    .profile-header ion-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
    }

    .profile-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: bold;
      color: var(--ion-text-color);
    }

    .profile-header p {
      margin: 8px 0;
      color: var(--ion-color-medium);
    }

    .profile-header ion-badge {
      font-size: 1rem;
      padding: 8px 16px;
    }

    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
      margin-top: 16px;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
      --background: transparent;
    }

    .custom-input {
      --background: var(--ion-color-light);
      --color: var(--ion-text-color);
      --placeholder-color: var(--ion-color-medium);
      --padding-start: 16px;
      --padding-end: 16px;
      --border-radius: 8px;
      margin-top: 8px;
    }

    .custom-select {
      --background: var(--ion-color-light);
      --color: var(--ion-text-color);
      --placeholder-color: var(--ion-color-medium);
      --padding-start: 16px;
      --padding-end: 16px;
      --border-radius: 8px;
      margin-top: 8px;
      width: 100%;
      max-width: 100%;
    }

    ion-button[size="small"] {
      margin-top: 8px;
    }

    ion-label {
      color: var(--ion-text-color) !important;
      font-weight: 500;
    }

    ion-select::part(placeholder),
    ion-select::part(text) {
      color: var(--ion-text-color);
    }

    ion-input::part(native),
    ion-textarea::part(native) {
      color: var(--ion-text-color);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  profile: WorkerProfile = {
    id: '',
    user: {
      id: '',
      first_name: '',
      last_name: '',
      email: ''
    },
    phone: '',
    address: '',
    bio: '',
    hourly_rate: 0,
    skills: [],
    rating: 0,
    total_shifts: 0,
    availability: {
      monday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      tuesday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      wednesday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      thursday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      friday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      saturday: { enabled: false, start_time: '09:00', end_time: '17:00' },
      sunday: { enabled: false, start_time: '09:00', end_time: '17:00' }
    }
  };
  isLoading = true;

  constructor(
    private workerService: WorkerService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.isLoading = true;
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        this.profile = {
          ...this.profile,
          ...profile,
          skills: profile.skills || []
        };
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load profile',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async saveProfile() {
    try {
      this.isLoading = true;
      await this.workerService.updateProfile(this.profile).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Profile updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Reload the profile to get the updated data
      await this.loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to update profile',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
} 