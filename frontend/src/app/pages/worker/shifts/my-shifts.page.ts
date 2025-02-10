import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../../services/shift.service';
import { Shift, ShiftStatus } from '../../../models/shift.model';
import { PaginatedResponse } from '../../../models/common.model';

@Component({
  selector: 'app-my-shifts',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Shifts</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedSegment" (ionChange)="segmentChanged()">
          <ion-segment-button value="upcoming">
            <ion-label>Upcoming</ion-label>
          </ion-segment-button>
          <ion-segment-button value="in_progress">
            <ion-label>In Progress</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Completed</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refreshShifts($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item-sliding *ngFor="let shift of filteredShifts">
          <ion-item>
            <ion-label>
              <h2>{{ shift.title }}</h2>
              <h3>{{ shift.start_time | date:'medium' }}</h3>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ shift.location_name ? shift.location_name + ' - ' : '' }}{{ shift.location_address || 'No location set' }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ shift.hourly_rate | currency }}/hr
              </p>
            </ion-label>
            <ion-badge slot="end" [color]="getStatusColor(shift.status)">
              {{ shift.status }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option *ngIf="canStartShift(shift)" color="primary" (click)="startShift(shift.id)">
              Start
            </ion-item-option>
            <ion-item-option *ngIf="canCompleteShift(shift)" color="success" (click)="completeShift(shift.id)">
              Complete
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="filteredShifts.length === 0 && !loading">
          <ion-label class="ion-text-center">
            <p>No shifts found</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-spinner *ngIf="loading" class="ion-margin ion-text-center"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    ion-segment {
      padding: 8px;
    }
    ion-item-sliding {
      margin-bottom: 1px;
    }
    ion-badge {
      margin-left: 8px;
    }
    ion-spinner {
      display: block;
      margin: 20px auto;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class MyShiftsPage implements OnInit {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];
  selectedSegment: 'upcoming' | 'completed' | 'in_progress' = 'upcoming';
  loading = true;
  currentPage = 1;
  perPage = 10;

  constructor(
    private shiftService: ShiftService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  loadShifts() {
    this.loading = true;
    this.shiftService.getWorkerShifts({
      page: this.currentPage,
      per_page: this.perPage,
      filter: this.selectedSegment
    }).subscribe({
      next: (response: PaginatedResponse<Shift>) => {
        if (response && response.data) {
          this.shifts = response.data;
          this.filteredShifts = this.shifts.sort((a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          );
        } else {
          this.shifts = [];
          this.filteredShifts = [];
        }
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading shifts:', error);
        this.shifts = [];
        this.filteredShifts = [];
        this.loading = false;
      }
    });
  }

  segmentChanged() {
    this.loadShifts();
  }

  canStartShift(shift: Shift): boolean {
    const now = new Date();
    const shiftStart = new Date(shift.start_time);
    const timeDiff = Math.abs(now.getTime() - shiftStart.getTime()) / (1000 * 60); // difference in minutes
    return shift.status === 'assigned' && timeDiff <= 15; // Can start within 15 minutes of shift start
  }

  canCompleteShift(shift: Shift): boolean {
    return shift.status === 'in_progress';
  }

  async startShift(shiftId: string) {
    try {
      await this.shiftService.startShift(shiftId).toPromise();
      this.loadShifts();
      
      const toast = await this.toastCtrl.create({
        message: 'Shift started successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error starting shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to start shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async completeShift(shiftId: string) {
    try {
      await this.shiftService.completeShift(shiftId, {}).toPromise();
      this.loadShifts();
      
      const toast = await this.toastCtrl.create({
        message: 'Shift completed successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error completing shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to complete shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  refreshShifts(event: any) {
    this.currentPage = 1;
    this.shiftService.getWorkerShifts({
      page: this.currentPage,
      per_page: this.perPage,
      filter: this.selectedSegment
    }).subscribe({
      next: (response: PaginatedResponse<Shift>) => {
        if (response && response.data) {
          this.shifts = response.data;
          this.filteredShifts = this.shifts.sort((a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          );
        } else {
          this.shifts = [];
          this.filteredShifts = [];
        }
        event.target.complete();
      },
      error: (error: Error) => {
        console.error('Error refreshing shifts:', error);
        this.shifts = [];
        this.filteredShifts = [];
        event.target.complete();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'assigned': return 'primary';
      case 'in_progress': return 'tertiary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }
} 