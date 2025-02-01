import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../../services/shift.service';
import { Shift, Location as ShiftLocation } from '../../../models/shift.model';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, AuthResponse } from '../../../services/auth.service';

type ShiftFormData = Omit<Partial<Shift>, 'location'> & {
  location: string | ShiftLocation;
};

@Component({
  selector: 'app-create-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business/shifts"></ion-back-button>
        </ion-buttons>
        <ion-title>Create New Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="createShift()" #shiftForm="ngForm">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Title</ion-label>
            <ion-input
              type="text"
              [(ngModel)]="shift.title"
              name="title"
              required
              #titleInput="ngModel"
              placeholder="Enter shift title">
            </ion-input>
            <ion-note color="danger" *ngIf="titleInput.invalid && titleInput.touched">
              Title is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Start Time</ion-label>
            <ion-datetime-button datetime="start"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime 
                  id="start"
                  [(ngModel)]="shift.start_time"
                  name="start_time"
                  presentation="date-time"
                  [min]="minDateTime"
                  [showDefaultButtons]="true"
                  (ionChange)="onStartTimeChange($event)"
                  [preferWheel]="true"
                  locale="en-US">
                </ion-datetime>
              </ng-template>
            </ion-modal>
            <ion-note color="medium">
              Must be at least 15 minutes from now
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">End Time</ion-label>
            <ion-datetime-button datetime="end"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime 
                  id="end"
                  [(ngModel)]="shift.end_time"
                  name="end_time"
                  presentation="date-time"
                  [min]="shift.start_time"
                  [showDefaultButtons]="true"
                  (ionChange)="onEndTimeChange($event)"
                  [preferWheel]="true"
                  locale="en-US">
                </ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Duration (hours)</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="shift.duration"
              name="duration"
              [readonly]="true"
              required>
            </ion-input>
            <ion-note color="medium" *ngIf="shift.duration">
              {{ formatDuration(shift.duration) }}
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Rate ($/hour)</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="shift.rate"
              name="rate"
              min="1"
              required
              #rateInput="ngModel"
              [class.ion-invalid]="rateInput.invalid && rateInput.touched"
              placeholder="Enter hourly rate">
            </ion-input>
            <ion-note color="danger" *ngIf="rateInput.invalid && rateInput.touched">
              Rate must be at least $1/hour
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Location</ion-label>
            <ion-input
              type="text"
              [(ngModel)]="shift.location"
              name="location"
              required
              #locationInput="ngModel"
              [class.ion-invalid]="locationInput.invalid && locationInput.touched"
              placeholder="Enter shift location">
            </ion-input>
            <ion-note color="danger" *ngIf="locationInput.invalid && locationInput.touched">
              Location is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Dress Code</ion-label>
            <ion-select
              [(ngModel)]="shift.dress_code"
              name="dress_code"
              placeholder="Select dress code">
              <ion-select-option value="casual">Casual</ion-select-option>
              <ion-select-option value="business_casual">Business Casual</ion-select-option>
              <ion-select-option value="formal">Formal</ion-select-option>
              <ion-select-option value="uniform">Uniform Required</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Notes (Optional)</ion-label>
            <ion-textarea
              [(ngModel)]="shift.notes"
              name="notes"
              rows="3"
              placeholder="Add any additional information about the shift"
              [counter]="true"
              maxlength="500">
            </ion-textarea>
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button 
            expand="block" 
            type="submit" 
            [disabled]="isSubmitting || !isValid()"
            class="ion-margin-bottom">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            {{ isSubmitting ? 'Creating...' : 'Create Shift' }}
          </ion-button>

          <ion-button 
            expand="block" 
            fill="clear" 
            color="medium" 
            routerLink="/business/shifts">
            Cancel
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-datetime {
      width: 100%;
    }

    ion-note {
      font-size: 0.8rem;
      margin-top: 4px;
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 16px;
    }

    @media (prefers-color-scheme: dark) {
      ion-item {
        --background: var(--ion-color-step-100);
        --color: var(--ion-color-light);
      }

      ion-label {
        --color: var(--ion-color-light);
      }

      ion-input, ion-textarea, ion-select {
        --color: var(--ion-color-light);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateShiftComponent implements OnInit {
  minDateTime = new Date(Date.now() + 900000).toISOString(); // 15 minutes from now

  shift: ShiftFormData = {
    title: '',
    start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    duration: 1,
    rate: 15,
    location: '',
    dress_code: '',
    notes: '',
    status: 'available'
  };

  isSubmitting = false;

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    try {
      // Validate auth status
      const user = await firstValueFrom(this.authService.currentUser);
      if (!user || user.role !== 'business_owner') {
        throw new Error('Unauthorized');
      }
      
      this.updateDuration();
    } catch (error) {
      console.error('Authentication error:', error);
      await this.showErrorToast('Please log in as a business owner');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  onStartTimeChange(event: any) {
    const startTime = new Date(event.detail.value);
    const endTime = new Date(this.shift.end_time || '');
    
    if (endTime <= startTime) {
      // If end time is before or equal to start time, set it to start time + 1 hour
      this.shift.end_time = new Date(startTime.getTime() + 3600000).toISOString();
    }
    
    this.updateDuration();
  }

  onEndTimeChange(event: any) {
    this.updateDuration();
  }

  private updateDuration() {
    if (this.shift.start_time && this.shift.end_time) {
      const startTime = new Date(this.shift.start_time);
      const endTime = new Date(this.shift.end_time);
      const diffMs = endTime.getTime() - startTime.getTime();
      this.shift.duration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal place
    }
  }

  formatDuration(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    }
    
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  isValid(): boolean {
    const location = this.shift.location;
    const isValidLocation = typeof location === 'string' ? 
      location.trim().length > 0 : 
      (location && 'formatted_address' in location);

    return !!(
      this.shift.title &&
      this.shift.title.trim().length > 0 &&
      this.shift.start_time &&
      this.shift.end_time &&
      this.shift.duration &&
      this.shift.duration > 0 &&
      this.shift.rate &&
      this.shift.rate > 0 &&
      isValidLocation &&
      new Date(this.shift.start_time) > new Date() &&
      new Date(this.shift.end_time) > new Date(this.shift.start_time)
    );
  }

  private async showLoadingIndicator(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Creating shift...',
      spinner: 'circular'
    });
    await loading.present();
    return loading;
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async showSuccessToast() {
    const toast = await this.toastController.create({
      message: 'Shift created successfully',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  async createShift() {
    if (!this.isValid()) {
      await this.showErrorToast('Please fill in all required fields correctly');
      return;
    }

    const loading = await this.showLoadingIndicator();
    
    try {
      this.isSubmitting = true;

      // Validate auth status before creating
      const user = await firstValueFrom(this.authService.currentUser);
      if (!user || user.role !== 'business_owner') {
        throw new Error('Unauthorized');
      }

      // Convert the form data to the API format
      const shiftData: Partial<Shift> = {
        ...this.shift,
        location: typeof this.shift.location === 'string' ? 
          this.shift.location : 
          this.shift.location.formatted_address
      };

      await firstValueFrom(this.shiftService.createShift(shiftData));
      await this.showSuccessToast();
      this.router.navigate(['/business/shifts']);
    } catch (error: any) {
      console.error('Error creating shift:', error);
      
      let errorMessage = 'Failed to create shift. Please try again.';
      if (error.message === 'Unauthorized') {
        errorMessage = 'Please log in to create shifts';
        this.authService.logout();
      } else if (error.error?.error?.[0]) {
        errorMessage = error.error.error[0];
      }

      await this.showErrorToast(errorMessage);
    } finally {
      this.isSubmitting = false;
      await loading.dismiss();
    }
  }
} 