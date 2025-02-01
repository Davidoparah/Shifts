import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-edit-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Shift</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onSubmit()" [disabled]="!shiftForm.valid || isLoading">
            Save
          </ion-button>
        </ion-buttons>
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
            formControlName="rate"
            min="0"
            step="0.01"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Location</ion-label>
          <ion-input
            type="text"
            formControlName="location"
            placeholder="Enter address"
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
          <ion-label position="floating">Requirements</ion-label>
          <ion-textarea
            formControlName="requirements"
            placeholder="Enter shift requirements"
          ></ion-textarea>
        </ion-item>
      </form>

      <div class="spinner-container" *ngIf="isLoading">
        <ion-spinner></ion-spinner>
        <p>Loading shift details...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--ion-color-medium);
    }

    ion-item {
      margin-bottom: 16px;
      --padding-start: 0;
      --border-color: var(--ion-color-light);

      ion-label {
        margin-bottom: 8px;
      }

      ion-input, ion-textarea {
        --padding-start: 16px;
        --padding-end: 16px;
        --padding-top: 16px;
        --padding-bottom: 16px;
        --background: var(--ion-color-light);
        border-radius: 8px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditShiftPage implements OnInit {
  shiftForm: FormGroup;
  isLoading = true;
  minDate = new Date().toISOString();
  shiftId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shiftService: ShiftService,
    private toastCtrl: ToastController
  ) {
    this.shiftForm = this.fb.group({
      title: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      dress_code: [''],
      notes: [''],
      requirements: ['']
    });
  }

  ngOnInit() {
    this.loadShift();
  }

  async loadShift() {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        throw new Error('No shift ID provided');
      }
      this.shiftId = id;

      const shift = await this.shiftService.getShift(id).toPromise();
      if (!shift) {
        throw new Error('Shift not found');
      }

      // Convert requirements array to string if it exists
      const requirements = shift.requirements ? shift.requirements.join(', ') : '';

      this.shiftForm.patchValue({
        ...shift,
        requirements
      });
    } catch (error) {
      console.error('Error loading shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load shift details',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      this.router.navigate(['/business-owner']);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.shiftForm.valid && this.shiftId) {
      try {
        this.isLoading = true;

        // Get form values
        const formValues = this.shiftForm.value;

        // Ensure dates are valid ISO strings
        const startTime = new Date(formValues.start_time);
        const endTime = new Date(formValues.end_time);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error('Invalid date format');
        }

        // Convert requirements string to array if it's a string
        const requirements = formValues.requirements ? 
          (typeof formValues.requirements === 'string' ? 
            formValues.requirements.split(',').map((r: string) => r.trim()).filter(Boolean) : 
            formValues.requirements) : 
          [];

        // Convert rate to number
        const rate = parseFloat(formValues.rate);
        if (isNaN(rate) || rate <= 0) {
          throw new Error('Rate must be a positive number');
        }

        const shiftData = {
          title: formValues.title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          rate: rate,
          location: formValues.location,
          dress_code: formValues.dress_code || '',
          notes: formValues.notes || '',
          requirements: requirements
        };

        await this.shiftService.updateShift(this.shiftId, shiftData).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Shift updated successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/business-owner']);
      } catch (error: any) {
        console.error('Error updating shift:', error);
        const errorMessage = error.message || 'Failed to update shift';
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
} 