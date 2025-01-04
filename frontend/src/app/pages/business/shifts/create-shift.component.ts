import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService, Shift } from '../../../services/shift.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Create New Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="createShift()">
        <ion-list>
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
                  (ionChange)="onStartTimeChange($event)">
                </ion-datetime>
              </ng-template>
            </ion-modal>
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
                  (ionChange)="onEndTimeChange($event)">
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
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Rate ($/hour)</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="shift.rate"
              name="rate"
              min="1"
              required>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Location</ion-label>
            <ion-input
              type="text"
              [(ngModel)]="shift.location"
              name="location"
              required>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Notes (Optional)</ion-label>
            <ion-textarea
              [(ngModel)]="shift.notes"
              name="notes"
              rows="3"
              placeholder="Add any additional information about the shift">
            </ion-textarea>
          </ion-item>
        </ion-list>

        <ion-button expand="block" type="submit" [disabled]="isSubmitting || !isValid()">
          {{ isSubmitting ? 'Creating...' : 'Create Shift' }}
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-datetime {
      width: 100%;
    }

    @media (prefers-color-scheme: dark) {
      ion-item {
        --background: var(--ion-color-step-100);
        --color: var(--ion-color-light);
      }

      ion-label {
        --color: var(--ion-color-light);
      }

      ion-input, ion-textarea {
        --color: var(--ion-color-light);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateShiftComponent implements OnInit {
  minDateTime = new Date(Date.now() + 900000).toISOString(); // 15 minutes from now

  shift: Partial<Shift> = {
    start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    duration: 1,
    rate: 15,
    location: '',
    notes: ''
  };

  isSubmitting = false;

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    try {
      // Validate auth status
      const user = await firstValueFrom(this.authService.validateToken());
      if (!user || user.role !== 'BUSINESS_OWNER') {
        throw new Error('Unauthorized');
      }
      
      this.updateDuration();
    } catch (error) {
      console.error('Authentication error:', error);
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/auth']);
      });
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

  isValid(): boolean {
    const location = this.shift.location;
    const isValidLocation = typeof location === 'string' ? 
      location.trim().length > 0 : 
      (location && location.formatted_address);

    return !!(
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

  async createShift() {
    if (!this.isValid()) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields correctly',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    try {
      this.isSubmitting = true;

      // Validate auth status before creating
      const user = await firstValueFrom(this.authService.validateToken());
      if (!user || user.role !== 'BUSINESS_OWNER') {
        throw new Error('Unauthorized');
      }

      await firstValueFrom(this.shiftService.createShift(this.shift));
      
      const toast = await this.toastController.create({
        message: 'Shift created successfully',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      
      this.router.navigate(['/business/shifts']);
    } catch (error: any) {
      console.error('Error creating shift:', error);
      
      let errorMessage = 'Failed to create shift. Please try again.';
      if (error.message === 'Unauthorized') {
        errorMessage = 'Please log in to create shifts';
        this.authService.logout().subscribe();
      } else if (error.error?.error?.[0]) {
        errorMessage = error.error.error[0];
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isSubmitting = false;
    }
  }
} 