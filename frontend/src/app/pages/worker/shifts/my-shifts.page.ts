import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../../services/shift.service';
import { Shift, ShiftStatus, canStart, canComplete } from '../../../models/shift.model';
import { PaginatedResponse } from '../../../models/common.model';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

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
          <ion-item-options side="start">
            <ion-item-option *ngIf="canUnassignShift(shift)" color="danger" (click)="unassignShift(shift)">
              <div class="option-inner">
                <ion-icon name="trash-outline" size="large"></ion-icon>
                <div>Unassign</div>
              </div>
            </ion-item-option>
          </ion-item-options>

          <ion-item>
            <ion-label (click)="viewShiftDetails(shift.id)">
              <h2>{{ shift.title }}</h2>
              <h3>{{ shift.business_name }}</h3>
              <p>{{ shift.start_time | date:'medium' }} - {{ shift.end_time | date:'medium' }}</p>
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
              <div class="option-inner">
                <ion-icon name="play" size="large"></ion-icon>
                <div>Start</div>
              </div>
            </ion-item-option>
            <ion-item-option *ngIf="canCompleteShift(shift)" color="success" (click)="completeShift(shift.id)">
              <div class="option-inner">
                <ion-icon name="checkmark" size="large"></ion-icon>
                <div>Complete</div>
              </div>
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
    ion-item-option {
      --padding-start: 0;
      --padding-end: 0;
      --min-width: 90px;
      height: 100%;
    }
    .option-inner {
      width: 100%;
      height: 100%;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .option-inner ion-icon {
      font-size: 24px;
    }
    .option-inner div {
      font-size: 14px;
      white-space: nowrap;
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
  currentUserId: string | null = null;

  constructor(
    private shiftService: ShiftService,
    private toastCtrl: ToastController,
    private router: Router,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.worker_profile?.id || null;
    console.log('Initialized with worker profile ID:', this.currentUserId);
  }

  ngOnInit() {
    this.loadShifts();
    // Subscribe to auth changes
    this.authService.currentUser.subscribe(user => {
      this.currentUserId = user?.worker_profile?.id || null;
      console.log('Updated worker profile ID:', this.currentUserId);
    });
  }

  loadShifts() {
    this.loading = true;
    console.log('Loading shifts with segment:', this.selectedSegment);
    
    const workerProfileId = this.authService.getCurrentUser()?.worker_profile?.id;
    console.log('Current worker profile ID:', workerProfileId);

    this.shiftService.getWorkerShifts({
      page: this.currentPage,
      per_page: this.perPage,
      filter: this.selectedSegment
    }).subscribe({
      next: (response: PaginatedResponse<Shift>) => {
        console.log('Worker shifts response:', response);
        if (response && response.data) {
          this.shifts = response.data;
          // Filter shifts based on the selected segment
          this.filteredShifts = this.shifts
            .filter(shift => {
              if (this.selectedSegment === 'upcoming') {
                const now = new Date();
                const isUpcoming = (
                  // Include both assigned and in_progress shifts
                  (shift.status === 'assigned' || shift.status === 'in_progress') &&
                  // Must be assigned to current worker
                  shift.worker_profile_id === workerProfileId &&
                  // End time must be in the future
                  new Date(shift.end_time) > now
                );
                console.log('Shift filtering:', {
                  shiftId: shift.id,
                  status: shift.status,
                  workerId: shift.worker_profile_id,
                  startTime: new Date(shift.start_time),
                  endTime: new Date(shift.end_time),
                  isUpcoming
                });
                return isUpcoming;
              }
              return shift.status === this.selectedSegment;
            })
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          
          console.log('Filtered shifts:', this.filteredShifts);
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
    if (!this.currentUserId) return false;
    return shift.status === 'assigned' && 
           shift.worker_profile_id === this.currentUserId &&
           new Date() >= new Date(new Date(shift.start_time).getTime() - 15 * 60000) && // 15 minutes before
           new Date() <= new Date(shift.end_time);
  }

  canCompleteShift(shift: Shift): boolean {
    if (!this.currentUserId) return false;
    return shift.status === 'in_progress' &&
           shift.worker_profile_id === this.currentUserId &&
           new Date() >= new Date(shift.start_time);
  }

  canUnassignShift(shift: Shift): boolean {
    if (!this.currentUserId) {
      console.log('No worker profile ID found');
      return false;
    }
    console.log('Checking can unassign:', {
      shiftId: shift.id,
      status: shift.status,
      workerProfileId: shift.worker_profile_id,
      currentUserId: this.currentUserId,
      startTime: shift.start_time
    });
    const canUnassign = shift.status === 'assigned' && 
           shift.worker_profile_id === this.currentUserId &&
           new Date() < new Date(shift.start_time);
    console.log('Can unassign result:', canUnassign);
    return canUnassign;
  }

  async startShift(shiftId: string) {
    try {
      console.log('Starting shift:', shiftId);
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
      await this.shiftService.completeShift(shiftId).toPromise();
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

  async unassignShift(shift: Shift) {
    try {
      await firstValueFrom(this.shiftService.unassignShift(shift.id));
      // Remove the unassigned shift from the current list
      this.shifts = this.shifts.filter(s => s.id !== shift.id);
      this.filteredShifts = this.filteredShifts.filter(s => s.id !== shift.id);
      await this.presentToast('Successfully unassigned from shift');
      // Navigate to available shifts tab and trigger a refresh
      await this.router.navigate(['/worker/available-shifts']);
      // Emit an event to refresh available shifts
      window.dispatchEvent(new CustomEvent('refresh-available-shifts'));
    } catch (error: any) {
      console.error('Error unassigning shift:', error);
      await this.presentToast(error.message || 'Failed to unassign from shift', 'danger');
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

  viewShiftDetails(shiftId: string) {
    this.router.navigate(['/worker/shifts/details', shiftId]);
  }

  private async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 