import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../../services/shift.service';
import { Shift, Location } from '../../../models/shift.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-schedule',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Schedule</ion-title>
      </ion-toolbar>
      <ion-segment [(ngModel)]="selectedTab" (ionChange)="onTabChange()">
        <ion-segment-button value="upcoming">
          <ion-label>Upcoming</ion-label>
        </ion-segment-button>
        <ion-segment-button value="applied">
          <ion-label>Applied</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Upcoming Shifts -->
      <ion-list *ngIf="selectedTab === 'upcoming'">
        <ion-item-sliding *ngFor="let shift of upcomingShifts">
          <ion-item>
            <ion-label>
              <h2>{{shift.business.name}}</h2>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{isLocationObject(shift.location) ? shift.location.formatted_address : shift.location}}
              </p>
              <p>
                <ion-icon name="time-outline"></ion-icon>
                {{formatDateTime(shift.start_time)}} - {{formatDateTime(shift.end_time)}}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{shift.rate | currency}}/hr
              </p>
              <ion-badge color="success">Confirmed</ion-badge>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="cancelShift(shift)">
              <ion-icon slot="icon-only" name="close-circle"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="upcomingShifts.length === 0">
          <ion-label class="ion-text-center">
            <p>No upcoming shifts</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Applied Shifts -->
      <ion-list *ngIf="selectedTab === 'applied'">
        <ion-item-sliding *ngFor="let shift of appliedShifts">
          <ion-item>
            <ion-label>
              <h2>{{shift.business.name}}</h2>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{isLocationObject(shift.location) ? shift.location.formatted_address : shift.location}}
              </p>
              <p>
                <ion-icon name="time-outline"></ion-icon>
                {{formatDateTime(shift.start_time)}} - {{formatDateTime(shift.end_time)}}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{shift.rate | currency}}/hr
              </p>
              <ion-badge color="warning">Pending</ion-badge>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="cancelApplication(shift)">
              <ion-icon slot="icon-only" name="close-circle"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="appliedShifts.length === 0">
          <ion-label class="ion-text-center">
            <p>No pending applications</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-label h2 {
      font-weight: 600;
      margin-bottom: 8px;
    }

    ion-label p {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 4px 0;
    }

    ion-icon {
      font-size: 16px;
      min-width: 16px;
    }

    ion-badge {
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SchedulePage implements OnInit {
  selectedTab = 'upcoming';
  upcomingShifts: Shift[] = [];
  appliedShifts: Shift[] = [];

  constructor(
    private shiftService: ShiftService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  isLocationObject(location: any): location is Location {
    return typeof location === 'object' && location !== null && 'formatted_address' in location;
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  onTabChange() {
    // Tab change handler if needed
  }

  async loadShifts() {
    try {
      const shifts = await firstValueFrom(this.shiftService.getWorkerShifts());
      this.categorizeShifts(shifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load shifts',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  categorizeShifts(shifts: Shift[]) {
    this.appliedShifts = shifts.filter(shift => shift.status === 'available');
    this.upcomingShifts = shifts.filter(shift => shift.status === 'assigned');
  }

  async handleRefresh(event: any) {
    await this.loadShifts();
    event.target.complete();
  }

  async cancelShift(shift: Shift) {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Shift',
      message: 'Are you sure you want to cancel this shift?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: async () => {
            try {
              await firstValueFrom(this.shiftService.cancelShift(shift.id));
              await this.loadShifts();
              
              const toast = await this.toastCtrl.create({
                message: 'Shift cancelled successfully',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('Error cancelling shift:', error);
              const toast = await this.toastCtrl.create({
                message: 'Failed to cancel shift',
                duration: 3000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelApplication(shift: Shift) {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Application',
      message: 'Are you sure you want to cancel your application for this shift?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: async () => {
            try {
              await firstValueFrom(this.shiftService.cancelShift(shift.id));
              await this.loadShifts();
              
              const toast = await this.toastCtrl.create({
                message: 'Application cancelled successfully',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('Error cancelling application:', error);
              const toast = await this.toastCtrl.create({
                message: 'Failed to cancel application',
                duration: 3000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
} 