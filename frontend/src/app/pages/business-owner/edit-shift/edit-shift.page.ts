import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService, Shift } from '../../../services/shift.service';

@Component({
  selector: 'app-edit-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Shift</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="shiftForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
        <ion-item>
          <ion-label position="floating">Title</ion-label>
          <ion-input formControlName="title" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Date</ion-label>
          <ion-datetime
            formControlName="date"
            presentation="date"
            [min]="minDate"
          ></ion-datetime>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Start Time</ion-label>
          <ion-datetime
            formControlName="startTime"
            presentation="time"
          ></ion-datetime>
        </ion-item>

        <ion-item>
          <ion-label position="floating">End Time</ion-label>
          <ion-datetime
            formControlName="endTime"
            presentation="time"
          ></ion-datetime>
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

        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          [disabled]="!shiftForm.valid"
        >
          Update Shift
        </ion-button>
      </form>

      <ion-spinner *ngIf="isLoading" class="spinner-center"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    ion-item {
      margin-bottom: 16px;
    }
    .spinner-center {
      display: block;
      margin: auto;
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditShiftPage implements OnInit {
  shiftForm: FormGroup;
  minDate: string = new Date().toISOString();
  isLoading = true;
  shiftId: string;

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.shiftForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0)]],
      location: ['', Validators.required]
    });

    this.shiftId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.loadShift();
  }

  async loadShift() {
    try {
      const shifts = await this.shiftService.getBusinessShifts().toPromise();
      if (!shifts) {
        throw new Error('Failed to load shifts');
      }
      const currentShift = shifts.find(s => s.id === this.shiftId);
      
      if (currentShift) {
        this.shiftForm.patchValue({
          title: currentShift.title,
          date: currentShift.date,
          startTime: currentShift.startTime,
          endTime: currentShift.endTime,
          rate: currentShift.rate,
          location: currentShift.location
        });
      } else {
        throw new Error('Shift not found');
      }
    } catch (error) {
      console.error('Error loading shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      this.router.navigate(['/business-owner']);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.shiftForm.valid) {
      try {
        const shiftData = {
          ...this.shiftForm.value,
          date: new Date(this.shiftForm.value.date).toISOString().split('T')[0],
          startTime: new Date(this.shiftForm.value.startTime).toLocaleTimeString(),
          endTime: new Date(this.shiftForm.value.endTime).toLocaleTimeString()
        };

        await this.shiftService.updateShift(this.shiftId, shiftData).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Shift updated successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/business-owner']);
      } catch (error) {
        console.error('Error updating shift:', error);
        const toast = await this.toastCtrl.create({
          message: 'Failed to update shift',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }
} 