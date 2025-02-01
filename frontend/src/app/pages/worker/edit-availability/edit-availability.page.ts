import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

interface TimeSlot {
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface DaySchedule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

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
        <ion-item-group *ngFor="let day of days">
          <ion-item-divider>
            <ion-label>{{ day | titlecase }}</ion-label>
            <ion-toggle [(ngModel)]="schedule[day].enabled" slot="end"></ion-toggle>
          </ion-item-divider>

          <ion-item *ngIf="schedule[day].enabled">
            <ion-label>Start Time</ion-label>
            <ion-datetime-button datetime="start-{{day}}"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime
                  id="start-{{day}}"
                  presentation="time"
                  [(ngModel)]="schedule[day].start_time"
                  minuteValues="0,15,30,45"
                ></ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>

          <ion-item *ngIf="schedule[day].enabled">
            <ion-label>End Time</ion-label>
            <ion-datetime-button datetime="end-{{day}}"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime
                  id="end-{{day}}"
                  presentation="time"
                  [(ngModel)]="schedule[day].end_time"
                  minuteValues="0,15,30,45"
                ></ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" (click)="saveAvailability()">
          Save Availability
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-dark);
      text-transform: capitalize;
      margin-top: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditAvailabilityPage implements OnInit {
  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  schedule: { [key: string]: DaySchedule } = {};

  constructor(
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    // Initialize schedule with default values
    this.days.forEach(day => {
      this.schedule[day] = {
        enabled: false,
        start_time: '09:00',
        end_time: '17:00'
      };
    });
  }

  async ngOnInit() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile && profile.availability) {
        Object.keys(profile.availability).forEach(day => {
          this.schedule[day] = profile.availability[day];
        });
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

  async saveAvailability() {
    try {
      await this.workerService.updateAvailability(this.schedule).toPromise();
      
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