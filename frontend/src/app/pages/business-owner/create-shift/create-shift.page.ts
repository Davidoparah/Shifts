import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';

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
      <form [formGroup]="shiftForm" (ngSubmit)="onSubmit()">
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
          Create Shift
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-item {
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CreateShiftPage implements OnInit {
  shiftForm: FormGroup;
  minDate: string = new Date().toISOString();

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
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
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.shiftForm.valid) {
      try {
        const shiftData = {
          ...this.shiftForm.value,
          date: new Date(this.shiftForm.value.date).toISOString().split('T')[0],
          startTime: new Date(this.shiftForm.value.startTime).toLocaleTimeString(),
          endTime: new Date(this.shiftForm.value.endTime).toLocaleTimeString()
        };

        await this.shiftService.createShift(shiftData).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Shift created successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/business-owner']);
      } catch (error) {
        console.error('Error creating shift:', error);
        const toast = await this.toastCtrl.create({
          message: 'Failed to create shift',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }
} 