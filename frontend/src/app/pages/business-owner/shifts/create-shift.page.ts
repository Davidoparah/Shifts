import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';

@Component({
  selector: 'app-create-shift',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner/shifts"></ion-back-button>
        </ion-buttons>
        <ion-title>Create Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form #shiftForm="ngForm" (ngSubmit)="createShift()">
        <ion-list class="ion-margin-bottom">
          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Title *</ion-label>
            <ion-input 
              fill="solid" 
              type="text" 
              [(ngModel)]="shift.title" 
              name="title" 
              required
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Start Time *</ion-label>
            <ion-datetime-button datetime="startTime" fill="solid"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime 
                  id="startTime" 
                  [(ngModel)]="shift.start_time" 
                  name="start_time" 
                  [min]="minDate" 
                  (ionChange)="onStartTimeChange()" 
                  presentation="date-time"
                  color="primary"
                >
                </ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">End Time *</ion-label>
            <ion-datetime-button datetime="endTime" fill="solid"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime 
                  id="endTime" 
                  [(ngModel)]="shift.end_time" 
                  name="end_time" 
                  [min]="minEndDate" 
                  presentation="date-time"
                  color="primary"
                >
                </ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Location Name *</ion-label>
            <ion-input 
              fill="solid" 
              type="text" 
              [(ngModel)]="shift.location_name" 
              name="location_name" 
              required
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Location Address *</ion-label>
            <ion-input 
              fill="solid" 
              type="text" 
              [(ngModel)]="shift.location_address" 
              name="location_address" 
              required
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Hourly Rate ($) *</ion-label>
            <ion-input 
              fill="solid" 
              type="number" 
              [(ngModel)]="shift.hourly_rate" 
              name="hourly_rate" 
              required 
              min="0"
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Dress Code</ion-label>
            <ion-input 
              fill="solid" 
              type="text" 
              [(ngModel)]="shift.dress_code" 
              name="dress_code"
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary">Requirements (comma-separated)</ion-label>
            <ion-input 
              fill="solid" 
              type="text" 
              [(ngModel)]="requirementsText" 
              name="requirements"
              class="custom-input"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-bottom">
            <ion-label position="floating" color="primary" id="notes-label">Notes</ion-label>
            <ion-textarea 
              fill="solid"
              [(ngModel)]="shift.notes" 
              name="notes"
              aria-labelledby="notes-label"
              label="Notes"
              labelPlacement="floating"
              class="custom-input"
              rows="4"
            ></ion-textarea>
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button 
            expand="block" 
            type="submit" 
            [disabled]="!shiftForm.valid || !isEndTimeValid"
            color="primary"
            class="ion-margin-bottom"
          >
            Create Shift
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    :host {
      --ion-color-step-50: #f2f2f2;
      --ion-color-step-100: #e6e6e6;
      --ion-color-step-150: #d9d9d9;
      --ion-color-step-200: #cccccc;
    }

    ion-item {
      --background: var(--ion-color-step-50);
      --border-radius: 8px;
      --border-color: var(--ion-color-step-150);
      margin-bottom: 16px;
    }

    .custom-input {
      --background: var(--ion-color-step-50);
      --color: var(--ion-text-color);
      --placeholder-color: var(--ion-color-step-200);
      --padding-start: 16px;
      --padding-end: 16px;
      --border-radius: 8px;
    }

    ion-datetime {
      --background: var(--ion-background-color);
      --ion-text-color: var(--ion-text-color);
    }

    ion-label {
      font-weight: 500;
    }

    .required-field::after {
      content: " *";
      color: var(--ion-color-danger);
    }

    @media (prefers-color-scheme: dark) {
      ion-item {
        --background: rgba(255, 255, 255, 0.05);
        --border-color: rgba(255, 255, 255, 0.1);
      }

      .custom-input {
        --background: rgba(255, 255, 255, 0.05);
        --placeholder-color: rgba(255, 255, 255, 0.3);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CreateShiftPage {
  shift: any = {
    title: '',
    start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    location_name: '',
    location_address: '',
    hourly_rate: null,
    dress_code: '',
    notes: ''
  };
  
  requirementsText: string = '';
  minDate = new Date().toISOString();
  minEndDate = this.shift.start_time;
  isEndTimeValid = true;

  constructor(
    private shiftService: ShiftService,
    private toastController: ToastController,
    private router: Router
  ) {}

  onStartTimeChange() {
    this.minEndDate = this.shift.start_time;
    if (this.shift.end_time) {
      this.validateEndTime();
    }
  }

  validateEndTime() {
    const startTime = new Date(this.shift.start_time).getTime();
    const endTime = new Date(this.shift.end_time).getTime();
    this.isEndTimeValid = endTime > startTime;
  }

  async createShift() {
    if (!this.isEndTimeValid) {
      const toast = await this.toastController.create({
        message: 'End time must be after start time',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    try {
      // Convert requirements text to array
      const requirements = this.requirementsText
        ? this.requirementsText.split(',').map(r => r.trim())
        : [];

      const shiftData = {
        ...this.shift,
        requirements
      };

      await this.shiftService.createShift(shiftData).toPromise();
      
      const toast = await this.toastController.create({
        message: 'Shift created successfully',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      
      // Navigate back to shifts list
      this.router.navigate(['/business-owner/shifts']);
    } catch (error: any) {
      console.error('Error creating shift:', error);
      const toast = await this.toastController.create({
        message: error.message || 'Failed to create shift',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
} 