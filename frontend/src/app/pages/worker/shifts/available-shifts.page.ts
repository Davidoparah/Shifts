import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-available-shifts',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Available Shifts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refreshShifts($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>Loading available shifts...</p>
      </div>

      <ion-list *ngIf="!loading">
        <ion-item-sliding *ngFor="let shift of availableShifts">
          <ion-item>
            <ion-label>
              <h2>{{ shift.title }}</h2>
              <h3>{{ shift.business?.name }}</h3>
              <p>
                <ion-icon name="calendar-outline"></ion-icon>
                {{ shift.start_time | date:'mediumDate' }}
              </p>
              <p>
                <ion-icon name="time-outline"></ion-icon>
                {{ shift.start_time | date:'shortTime' }} - {{ shift.end_time | date:'shortTime' }}
              </p>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ shift.location }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ shift.rate | currency }}/hr
              </p>
              <ion-note *ngIf="shift.requirements && shift.requirements.length > 0">
                <ion-icon name="list-outline"></ion-icon>
                Requirements: {{ shift.requirements.join(', ') }}
              </ion-note>
            </ion-label>
            <ion-button slot="end" (click)="applyForShift(shift)" fill="clear" color="primary">
              Apply
            </ion-button>
          </ion-item>
        </ion-item-sliding>

        <ion-item *ngIf="availableShifts.length === 0 && !loading">
          <ion-label class="ion-text-center">
            <p>No available shifts found</p>
            <p>Pull to refresh to check for new shifts</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
    }
    ion-label {
      h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 4px;
      }
      h3 {
        color: var(--ion-color-medium);
        margin-bottom: 8px;
      }
      p {
        margin: 4px 0;
        display: flex;
        align-items: center;
        
        ion-icon {
          margin-right: 8px;
          color: var(--ion-color-medium);
        }
      }
    }
    ion-note {
      display: flex;
      align-items: center;
      margin-top: 8px;
      color: var(--ion-color-medium);
      
      ion-icon {
        margin-right: 8px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class AvailableShiftsPage implements OnInit {
  availableShifts: Shift[] = [];
  loading = true;

  constructor(
    private shiftService: ShiftService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadAvailableShifts();
  }

  loadAvailableShifts() {
    this.loading = true;
    this.shiftService.getAvailableShifts().subscribe(
      shifts => {
        this.availableShifts = shifts.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        this.loading = false;
      },
      error => {
        console.error('Error loading available shifts:', error);
        this.loading = false;
        this.showErrorToast('Failed to load available shifts');
      }
    );
  }

  async applyForShift(shift: Shift) {
    const alert = await this.alertCtrl.create({
      header: 'Apply for Shift',
      message: `Are you sure you want to apply for "${shift.title}" at ${shift.business?.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: () => this.submitApplication(shift)
        }
      ]
    });

    await alert.present();
  }

  private async submitApplication(shift: Shift) {
    try {
      await this.shiftService.applyForShift(shift.id).toPromise();
      
      // Remove the shift from the list
      this.availableShifts = this.availableShifts.filter(s => s.id !== shift.id);
      
      const toast = await this.toastCtrl.create({
        message: 'Successfully applied for shift',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error applying for shift:', error);
      this.showErrorToast('Failed to apply for shift');
    }
  }

  refreshShifts(event: any) {
    this.shiftService.getAvailableShifts().subscribe(
      shifts => {
        this.availableShifts = shifts.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        event.target.complete();
      },
      error => {
        console.error('Error refreshing shifts:', error);
        event.target.complete();
        this.showErrorToast('Failed to refresh shifts');
      }
    );
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
} 