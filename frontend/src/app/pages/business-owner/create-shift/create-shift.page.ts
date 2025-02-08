import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-create-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner"></ion-back-button>
        </ion-buttons>
        <ion-title>Create Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="shiftForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
        <ion-item>
          <ion-label position="floating">Title</ion-label>
          <ion-input formControlName="title" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Start Time</ion-label>
          <ion-datetime-button datetime="start_time"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime
                id="start_time"
                formControlName="start_time"
                [min]="minDate"
                [showDefaultButtons]="true"
                presentation="date-time"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="floating">End Time</ion-label>
          <ion-datetime-button datetime="end_time"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime
                id="end_time"
                formControlName="end_time"
                [min]="shiftForm.get('start_time')?.value || minDate"
                [showDefaultButtons]="true"
                presentation="date-time"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Hourly Rate ($)</ion-label>
          <ion-input
            type="number"
            formControlName="hourly_rate"
            min="0"
            step="0.01"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Location Name</ion-label>
          <ion-input
            type="text"
            formControlName="location_name"
            placeholder="Enter location name"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Location Address</ion-label>
          <ion-input
            type="text"
            formControlName="location_address"
            placeholder="Enter full address"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Dress Code</ion-label>
          <ion-input
            type="text"
            formControlName="dress_code"
            placeholder="Enter dress code requirements"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Notes</ion-label>
          <ion-textarea
            formControlName="notes"
            placeholder="Enter any additional notes"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Requirements (one per line)</ion-label>
          <ion-textarea
            formControlName="requirements"
            placeholder="Enter shift requirements"
          ></ion-textarea>
        </ion-item>

        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          [disabled]="!shiftForm.valid || isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create Shift' }}
        </ion-button>
      </form>

      <div class="spinner-container" *ngIf="isLoading">
        <ion-spinner></ion-spinner>
      </div>
    </ion-content>
  `,
  styleUrls: ['./create-shift.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CreateShiftPage implements OnInit {
  shiftForm: FormGroup;
  minDate: string = new Date().toISOString();
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.shiftForm = this.fb.group({
      title: ['', Validators.required],
      start_time: [new Date(Date.now() + 3600000).toISOString(), Validators.required],
      end_time: [new Date(Date.now() + 7200000).toISOString(), Validators.required],
      hourly_rate: ['', [Validators.required, Validators.min(0)]],
      location_name: ['', Validators.required],
      location_address: ['', Validators.required],
      dress_code: [''],
      notes: [''],
      requirements: ['']
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.shiftForm.invalid) {
      return;
    }

    this.isLoading = true;

    try {
      const formData = this.shiftForm.value;
      
      // Convert requirements from text to array if present
      const requirements = formData.requirements
        ? formData.requirements.split('\n').filter((r: string) => r.trim())
        : [];

      const shiftData = {
        ...formData,
        requirements,
        // Generate a temporary location_id if needed
        location_id: `temp_${Date.now()}`
      };

      await this.shiftService.createShift(shiftData).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Shift created successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      this.router.navigate(['/business-owner']);
    } catch (error: any) {
      console.error('Error creating shift:', error);
      const errorMessage = error.message || 'Failed to create shift';
      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
} 