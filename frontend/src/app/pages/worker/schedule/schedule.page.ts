import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../../services/shift.service';
import { Shift, Location } from '../../../models/shift.model';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponse } from '../../../models/common.model';
import { AuthService } from '../../../core/services/auth.service';

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
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
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
              <ion-badge [color]="shift.status === 'in_progress' ? 'primary' : 'success'">
                {{shift.status === 'in_progress' ? 'In Progress' : 'Confirmed'}}
              </ion-badge>
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
  upcomingShifts: Shift[] = [];
  loading = false;
  currentPage = 1;
  perPage = 10;
  selectedSegment = '';

  constructor(
    private shiftService: ShiftService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadShifts();
    this.startPeriodicRefresh();
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

  loadShifts() {
    this.loading = true;
    console.log('Loading shifts in schedule page...');
    
    const currentWorkerProfileId = this.authService.getCurrentUser()?.worker_profile?.id;
    console.log('Schedule page - Current worker profile ID:', currentWorkerProfileId);

    this.shiftService.getWorkerShifts({
      page: this.currentPage,
      per_page: this.perPage,
      filter: 'upcoming'
    }).subscribe({
      next: (response: PaginatedResponse<Shift>) => {
        console.log('Schedule page - Worker shifts response:', response);
        if (response && response.data) {
          console.log('Schedule page - Raw shifts data:', response.data);
          console.log('Schedule page - Detailed shifts info:', response.data.map(s => ({
            id: s.id,
            status: s.status,
            worker_id: s.worker_profile_id,
            start_time: s.start_time,
            business_name: s.business_name
          })));
          this.categorizeShifts(response.data);
        } else {
          console.log('Schedule page - No shifts data in response');
          this.upcomingShifts = [];
        }
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Schedule page - Error loading shifts:', error);
        this.upcomingShifts = [];
        this.loading = false;
      }
    });
  }

  categorizeShifts(shifts: Shift[]) {
    if (!shifts) {
      console.log('No shifts provided to categorize');
      this.upcomingShifts = [];
      return;
    }

    const currentWorkerProfileId = this.authService.getCurrentUser()?.worker_profile?.id;
    console.log('Categorizing shifts for worker:', currentWorkerProfileId);
    console.log('Total shifts to categorize:', shifts.length);
    
    // Filter shifts for upcoming tab
    this.upcomingShifts = shifts.filter(shift => {
      const isAssignedOrInProgress = shift.status === 'assigned' || shift.status === 'in_progress';
      const isForWorker = shift.worker_profile_id === currentWorkerProfileId;
      const isUpcoming = new Date(shift.start_time) > new Date();
      
      console.log(`Shift ${shift.id}:`, {
        status: shift.status,
        worker_id: shift.worker_profile_id,
        start_time: shift.start_time,
        isAssignedOrInProgress,
        isForWorker,
        isUpcoming
      });
      
      return isAssignedOrInProgress && isForWorker && isUpcoming;
    });

    console.log('Filtered upcoming shifts:', this.upcomingShifts);

    // Sort by start time
    this.upcomingShifts.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    console.log('Final sorted upcoming shifts:', this.upcomingShifts);
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

  // Add a method to start periodic refresh
  startPeriodicRefresh() {
    // Refresh every 30 seconds
    setInterval(() => {
      console.log('Schedule page - Performing periodic refresh');
      this.loadShifts();
    }, 30000);
  }
} 