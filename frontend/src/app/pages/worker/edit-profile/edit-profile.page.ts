import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

@Component({
  selector: 'app-edit-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onSubmit()" [disabled]="!profileForm.valid || isLoading">
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="profileForm" *ngIf="!isLoading">
        <ion-list>
          <ion-item-group>
            <ion-item-divider>
              <ion-label>Personal Information</ion-label>
            </ion-item-divider>

            <ion-item>
              <ion-label position="stacked">Phone Number</ion-label>
              <ion-input formControlName="phone" type="tel" placeholder="Enter your phone number"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Address</ion-label>
              <ion-input formControlName="address" type="text" placeholder="Enter your address"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Bio</ion-label>
              <ion-textarea 
                formControlName="bio" 
                rows="4" 
                placeholder="Tell us about yourself, your experience, and what makes you a great worker"
              ></ion-textarea>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider>
              <ion-label>Work Preferences</ion-label>
            </ion-item-divider>

            <ion-item>
              <ion-label position="stacked">Hourly Rate ($)</ion-label>
              <ion-input 
                formControlName="hourly_rate" 
                type="number" 
                min="0" 
                placeholder="Enter your desired hourly rate"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Skills</ion-label>
              <ion-select formControlName="skills" multiple="true" placeholder="Select your skills">
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
      </form>

      <div *ngIf="isLoading" class="ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Loading profile...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --background: var(--ion-color-light);
      --border-radius: 8px;
      margin-bottom: 8px;
    }

    ion-item-divider {
      --background: transparent;
      --padding-top: 20px;
      --padding-bottom: 10px;
      font-weight: bold;
      font-size: 1.1em;
    }

    ion-textarea {
      --background: var(--ion-color-light);
      --padding-start: 10px;
      --padding-end: 10px;
      --border-radius: 8px;
    }

    ion-select {
      width: 100%;
      max-width: 100%;
    }

    .error-message {
      color: var(--ion-color-danger);
      font-size: 0.8em;
      margin: 4px 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditProfilePage implements OnInit {
  profileForm: FormGroup;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.profileForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      hourly_rate: ['', [Validators.required, Validators.min(0)]],
      skills: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  async ngOnInit() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        this.profileForm.patchValue({
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          hourly_rate: profile.hourly_rate,
          skills: profile.skills || []
        });
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

  async onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      try {
        await this.workerService.updateProfile(this.profileForm.value).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Profile updated successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/worker']);
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
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in all required fields correctly',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    }
  }
} 