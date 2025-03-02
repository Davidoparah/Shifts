import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService } from '../../../services/worker.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { WorkerProfile } from '../../../core/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Worker Profile Setup</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form #profileForm="ngForm" (ngSubmit)="saveProfile()">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Phone Number*</ion-label>
            <ion-input
              type="tel"
              [(ngModel)]="profile.phone"
              name="phone"
              required
              #phone="ngModel"
            ></ion-input>
            <ion-note color="danger" *ngIf="phone.invalid && (phone.dirty || phone.touched)">
              Phone number is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Address*</ion-label>
            <ion-textarea
              [(ngModel)]="profile.address"
              name="address"
              required
              rows="3"
              #address="ngModel"
            ></ion-textarea>
            <ion-note color="danger" *ngIf="address.invalid && (address.dirty || address.touched)">
              Address is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Bio*</ion-label>
            <ion-textarea
              [(ngModel)]="profile.bio"
              name="bio"
              required
              placeholder="Tell us about your experience..."
              rows="4"
              #bio="ngModel"
            ></ion-textarea>
            <ion-note color="danger" *ngIf="bio.invalid && (bio.dirty || bio.touched)">
              Bio is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Hourly Rate*</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="profile.hourly_rate"
              name="hourly_rate"
              required
              min="1"
              #hourlyRate="ngModel"
            ></ion-input>
            <ion-note color="danger" *ngIf="hourlyRate.invalid && (hourlyRate.dirty || hourlyRate.touched)">
              Hourly rate must be greater than 0
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Skills*</ion-label>
            <ion-select
              [(ngModel)]="profile.skills"
              name="skills"
              multiple="true"
              required
              #skills="ngModel"
            >
              <ion-select-option value="security">Security</ion-select-option>
              <ion-select-option value="first_aid">First Aid</ion-select-option>
              <ion-select-option value="crowd_control">Crowd Control</ion-select-option>
              <ion-select-option value="cctv">CCTV Operation</ion-select-option>
              <ion-select-option value="access_control">Access Control</ion-select-option>
            </ion-select>
            <ion-note color="danger" *ngIf="skills.invalid && (skills.dirty || skills.touched)">
              Please select at least one skill
            </ion-note>
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="!profileForm.form.valid || isLoading">
            {{ isLoading ? 'Saving...' : 'Save Profile' }}
          </ion-button>
        </div>
      </form>

      <ion-card *ngIf="showVerification">
        <ion-card-header>
          <ion-card-title>Required Documents</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Security License</ion-label>
              <ion-button slot="end" size="small" (click)="uploadDocument('security_license')">
                Upload
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-label>ID Verification</ion-label>
              <ion-button slot="end" size="small" (click)="uploadDocument('id_verification')">
                Upload
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: var(--ion-color-light);
    }
    form {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    ion-item {
      --padding-start: 0;
      --border-color: var(--ion-color-medium-shade);
      --background: transparent;
    }
    ion-button[type="submit"] {
      margin-top: 16px;
    }
    ion-note {
      padding-left: 16px;
      margin-top: 4px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfilePage implements OnInit {
  @ViewChild('profileForm') profileForm!: NgForm;
  
  profile: Partial<WorkerProfile> = {
    phone: '',
    address: '',
    bio: '',
    hourly_rate: 1,
    skills: []
  };
  
  showVerification = false;
  isLoading = false;

  constructor(
    private workerService: WorkerService,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        await this.router.navigate(['/auth/login']);
        return;
      }

      const response = await this.workerService.getProfile().toPromise();
      if (response?.worker_profile) {
        this.profile = response.worker_profile;
        this.showVerification = true;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      await this.presentToast('Error loading profile. Please try again.', 'danger');
    }
  }

  async saveProfile() {
    if (!this.profileForm.valid) {
      await this.presentToast('Please fill in all required fields correctly', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      console.log('Sending profile update with data:', this.profile);
      
      const response = await firstValueFrom(this.workerService.updateProfile(this.profile));
      console.log('Profile update response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.worker_profile) {
        throw new Error('No worker profile in response');
      }

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user found');
      }

      this.authService.updateCurrentUser({
        ...currentUser,
        worker_profile: response.worker_profile
      });

      await this.presentToast('Profile saved successfully', 'success');
      this.showVerification = true;
      await this.router.navigate(['/worker/available-shifts']);
      
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error status:', error.status);
      console.error('Error response:', error.error);
      
      let errorMessage = 'Error saving profile';
      
      if (error.error?.errors) {
        errorMessage = Array.isArray(error.error.errors) 
          ? error.error.errors.join(', ') 
          : error.error.errors;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.presentToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async uploadDocument(type: string) {
    // TODO: Implement document upload
    console.log('Uploading document:', type);
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 