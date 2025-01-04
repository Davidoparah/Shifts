import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

@Component({
  selector: 'app-edit-availability',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Availability</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let day of days">
          <ion-label>{{ day }}</ion-label>
          <ion-button slot="end" (click)="addSlot(day)">Add Time Slot</ion-button>
        </ion-item>

        <ion-item *ngFor="let slot of schedule[selectedDay]?.slots; let i = index">
          <ion-label>
            <ion-datetime
              presentation="time"
              [(ngModel)]="slot.start"
              (ionChange)="updateSlot(selectedDay, i, 'start', $event)"
            ></ion-datetime>
            to
            <ion-datetime
              presentation="time"
              [(ngModel)]="slot.end"
              (ionChange)="updateSlot(selectedDay, i, 'end', $event)"
            ></ion-datetime>
          </ion-label>
          <ion-button slot="end" color="danger" (click)="removeSlot(selectedDay, i)">
            <ion-icon name="trash-outline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="saveAvailability()">
        Save Availability
      </ion-button>
    </ion-content>
  `,
  styles: [`
    ion-item {
      margin-bottom: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditAvailabilityPage implements OnInit {
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDay = 'Monday';
  schedule: { [key: string]: { slots: Array<{ start: string; end: string }> } } = {};

  constructor(
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    // Initialize schedule for each day
    this.days.forEach(day => {
      this.schedule[day] = { slots: [] };
    });
  }

  async ngOnInit() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        // Initialize schedule with existing time slots
        if (profile.time_slots) {
          Object.keys(profile.time_slots).forEach(day => {
            this.schedule[day].slots = profile.time_slots![day].map(slot => ({
              start: slot.start,
              end: slot.end
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load availability',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  addSlot(day: string) {
    this.schedule[day].slots.push({
      start: '09:00',
      end: '17:00'
    });
  }

  removeSlot(day: string, index: number) {
    this.schedule[day].slots.splice(index, 1);
  }

  updateSlot(day: string, index: number, field: 'start' | 'end', event: any) {
    this.schedule[day].slots[index][field] = event.detail.value;
  }

  async saveAvailability() {
    try {
      const availability = Object.keys(this.schedule).reduce((acc, day) => {
        if (this.schedule[day].slots.length > 0) {
          acc[day] = this.schedule[day].slots;
        }
        return acc;
      }, {} as { [key: string]: Array<{ start: string; end: string }> });

      await this.workerService.updateAvailability(availability).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Availability updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      this.router.navigate(['/worker']);
    } catch (error) {
      console.error('Error updating availability:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to update availability',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
} 