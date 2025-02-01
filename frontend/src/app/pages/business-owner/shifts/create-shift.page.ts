import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';

@Component({
  selector: 'app-create-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner/shifts"></ion-back-button>
        </ion-buttons>
        <ion-title>Create Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form #shiftForm="ngForm" (ngSubmit)="createShift()">
        <ion-item>
          <ion-label position="stacked">Title</ion-label>
          <ion-input type="text" [(ngModel)]="shift.title" name="title" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Start Time</ion-label>
          <ion-datetime-button datetime="startTime"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime id="startTime" [(ngModel)]="shift.start_time" name="start_time" 
                           [min]="minDate" (ionChange)="onStartTimeChange()" presentation="date-time">
              </ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">End Time</ion-label>
          <ion-datetime-button datetime="endTime"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime id="endTime" [(ngModel)]="shift.end_time" name="end_time" 
                           [min]="minEndDate" presentation="date-time">
              </ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Location</ion-label>
          <ion-input type="text" [(ngModel)]="shift.location" name="location" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Rate ($/hr)</ion-label>
          <ion-input type="number" [(ngModel)]="shift.rate" name="rate" required min="0"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Dress Code</ion-label>
          <ion-input type="text" [(ngModel)]="shift.dress_code" name="dress_code"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Requirements (comma-separated)</ion-label>
          <ion-input type="text" [(ngModel)]="requirementsText" name="requirements"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Notes</ion-label>
          <ion-textarea [(ngModel)]="shift.notes" name="notes"></ion-textarea>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="!shiftForm.valid || !isEndTimeValid">
          Create Shift
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CreateShiftPage {
  shift: any = {
    title: '',
    start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    location: '',
    rate: null,
    dress_code: '',
    notes: ''
  };
  
  requirementsText: string = '';
  minDate = new Date().toISOString();
  minEndDate = this.shift.start_time;
  isEndTimeValid = true;

  constructor(
    private shiftService: ShiftService,
    private toastController: ToastController
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
      window.history.back();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error.message || 'Failed to create shift',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
} 