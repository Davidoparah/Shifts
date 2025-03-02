import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { AuthService } from '../../../core/services/auth.service';
import { Shift } from '../../../models/shift.model';
import { User, WorkerProfile } from '../../../core/models/user.model';
import { Router } from '@angular/router';
import { WorkerService } from '../../../services/worker.service';
import { firstValueFrom } from 'rxjs';

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
              <h2>{{ shift.title || 'Untitled Shift' }}</h2>
              <h3>{{ shift.business_name || 'Business Name Not Available' }}</h3>
              <p>{{ shift.start_time | date:'medium' }} - {{ shift.end_time | date:'medium' }}</p>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ shift.location_name ? shift.location_name + ' - ' : '' }}{{ shift.location_address || 'Location not specified' }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ shift.hourly_rate | currency }}/hr
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
export class AvailableShiftsPage implements OnInit, OnDestroy {
  availableShifts: Shift[] = [];
  loading = true;
  currentPage = 1;
  perPage = 10;
  currentUserId: string | undefined;
  private refreshListener: () => void;

  constructor(
    private shiftService: ShiftService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private router: Router,
    private workerService: WorkerService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id;
    
    // Add refresh event listener
    this.refreshListener = () => {
      console.log('Refresh event received, reloading available shifts...');
      this.loadShifts();
    };
    window.addEventListener('refresh-available-shifts', this.refreshListener);
  }

  ngOnInit() {
    this.loadShifts();
  }

  ngOnDestroy() {
    // Remove the event listener when component is destroyed
    window.removeEventListener('refresh-available-shifts', this.refreshListener);
  }

  loadShifts() {
    this.loading = true;
    this.shiftService.getAvailableShifts({
      page: this.currentPage,
      per_page: this.perPage
    }).subscribe({
      next: (response) => {
        console.log('Available shifts response:', response);
        this.availableShifts = response.data.sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        console.log('Sorted available shifts:', this.availableShifts);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        this.loading = false;
      }
    });
  }

  async applyForShift(shift: Shift) {
    const businessName = shift.business_name || 'this business';
    const shiftTitle = shift.title || 'this shift';

    const alert = await this.alertCtrl.create({
      header: 'Apply for Shift',
      message: `Are you sure you want to apply for "${shiftTitle}" at ${businessName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: () => this.applyToShift(shift)
        }
      ]
    });

    await alert.present();
  }

  async applyToShift(shift: Shift) {
    if (!this.authService.isAuthenticated()) {
      await this.presentToast('Please log in to apply for shifts', 'warning');
      return;
    }

    const currentUser = this.authService.getCurrentUser() as User | null;
    console.log('Current user:', currentUser);
    console.log('Worker profile:', currentUser?.worker_profile);
    
    if (!currentUser) {
      await this.presentToast('User not found', 'warning');
      return;
    }

    if (!currentUser.worker_profile) {
      // If worker profile doesn't exist, try to fetch it
      try {
        const workerProfile = await this.fetchWorkerProfile();
        if (!workerProfile) {
          await this.presentToast('Please complete your worker profile setup', 'warning');
          // Optionally navigate to profile setup
          this.router.navigate(['/worker/profile/setup']);
          return;
        }
      } catch (error) {
        console.error('Error fetching worker profile:', error);
        await this.presentToast('Error loading worker profile', 'danger');
        return;
      }
    }

    try {
      await firstValueFrom(this.shiftService.applyForShift(shift.id));
      await this.loadShifts();
      await this.presentToast('Successfully applied to shift');
    } catch (error) {
      console.error('Error applying to shift:', error);
      await this.presentToast('Failed to apply to shift', 'danger');
    }
  }

  private async fetchWorkerProfile(): Promise<WorkerProfile | null> {
    try {
      const response = await this.workerService.getProfile().toPromise();
      if (response && response.worker_profile) {
        // Update the auth service with the worker profile
        const currentUser = this.authService.getCurrentUser() as User;
        currentUser.worker_profile = response.worker_profile;
        return response.worker_profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      return null;
    }
  }

  refreshShifts(event: any) {
    this.currentPage = 1;
    this.shiftService.getAvailableShifts({
      page: this.currentPage,
      per_page: this.perPage
    }).subscribe({
      next: (response) => {
        this.availableShifts = response.data.sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        event.target.complete();
      },
      error: (error) => {
        console.error('Error refreshing shifts:', error);
        event.target.complete();
      }
    });
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