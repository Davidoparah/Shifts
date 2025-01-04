import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Worker, WorkerService, WorkerShift } from '../../../services/worker.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-worker-history',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ worker.name }}'s History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Worker Stats -->
      <ion-card>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <div class="stat-label">Total Shifts</div>
                <div class="stat-value">{{ worker.shifts_completed }}</div>
              </ion-col>
              <ion-col size="6">
                <div class="stat-label">Rating</div>
                <div class="stat-value">{{ worker.rating ? worker.rating.toFixed(1) + ' ⭐' : 'N/A' }}</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Current Shift -->
      <ion-list-header>
        <ion-label>Current Shift</ion-label>
      </ion-list-header>
      
      <ion-card *ngIf="worker.current_shift" class="shift-card">
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
            <ion-label>
              {{ formatDateTime(worker.current_shift.start_time) }} - 
              {{ formatDateTime(worker.current_shift.end_time) }}
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
            <ion-label>{{ worker.current_shift.location }}</ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-item *ngIf="!worker.current_shift" lines="none">
        <ion-label color="medium" class="ion-text-center">
          No active shift
        </ion-label>
      </ion-item>

      <!-- Upcoming Shifts -->
      <ion-list-header>
        <ion-label>Upcoming Shifts</ion-label>
      </ion-list-header>

      <ion-card *ngFor="let shift of worker.upcoming_shifts" class="shift-card">
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon name="time-outline" slot="start" color="warning"></ion-icon>
            <ion-label>
              {{ formatDateTime(shift.start_time) }} - 
              {{ formatDateTime(shift.end_time) }}
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-icon name="location-outline" slot="start" color="warning"></ion-icon>
            <ion-label>{{ shift.location }}</ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-item *ngIf="!worker.upcoming_shifts?.length" lines="none">
        <ion-label color="medium" class="ion-text-center">
          No upcoming shifts
        </ion-label>
      </ion-item>

      <!-- Past Shifts -->
      <ion-list-header>
        <ion-label>Past Shifts</ion-label>
      </ion-list-header>

      <ion-item *ngIf="isLoading" lines="none">
        <ion-label class="ion-text-center">
          <ion-spinner></ion-spinner>
          <p>Loading shift history...</p>
        </ion-label>
      </ion-item>

      <ion-item *ngIf="!isLoading && !pastShifts?.length" lines="none">
        <ion-label color="medium" class="ion-text-center">
          No past shifts
        </ion-label>
      </ion-item>

      <ion-list>
        <ion-card *ngFor="let shift of pastShifts" class="shift-card">
          <ion-card-content>
            <ion-item lines="none">
              <ion-icon name="time-outline" slot="start" color="medium"></ion-icon>
              <ion-label>
                {{ formatDateTime(shift.start_time) }} - 
                {{ formatDateTime(shift.end_time) }}
              </ion-label>
              <ion-badge slot="end" [color]="shift.status === 'completed' ? 'success' : 'danger'">
                {{ shift.status }}
              </ion-badge>
            </ion-item>
            <ion-item lines="none">
              <ion-icon name="location-outline" slot="start" color="medium"></ion-icon>
              <ion-label>{{ shift.location }}</ion-label>
            </ion-item>
            <ion-item *ngIf="shift.status === 'completed'" lines="none">
              <ion-icon name="star-outline" slot="start" color="warning"></ion-icon>
              <ion-label>
                {{ shift.rating ? 'Rating: ' + shift.rating + ' ⭐' : 'Not rated' }}
              </ion-label>
              <ion-button 
                *ngIf="!shift.rating" 
                slot="end" 
                fill="clear" 
                color="warning"
                (click)="rateShift(shift)">
                Rate
              </ion-button>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <ion-infinite-scroll
        [disabled]="!hasMoreShifts"
        (ionInfinite)="loadMoreShifts($event)"
        position="bottom">
        <ion-infinite-scroll-content
          loadingSpinner="bubbles"
          loadingText="Loading more shifts...">
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    ion-content {
      height: 100%;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--ion-color-dark);
    }

    .shift-card {
      margin: 8px 0;
      border-radius: 12px;
    }

    ion-item {
      --padding-start: 0;
    }

    ion-list-header {
      padding-top: 16px;
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    ion-list {
      padding: 0;
    }

    ion-infinite-scroll {
      margin-top: 16px;
    }

    @media (prefers-color-scheme: dark) {
      .stat-value {
        color: var(--ion-color-light);
      }

      ion-card {
        background: var(--ion-color-step-150);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WorkerHistoryComponent implements OnInit {
  worker: Worker;
  pastShifts: WorkerShift[] = [];
  currentPage: number = 1;
  isLoading: boolean = false;
  hasMoreShifts: boolean = true;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private workerService: WorkerService,
    private toastController: ToastController
  ) {
    this.worker = this.navParams.get('worker');
  }

  ngOnInit() {
    this.loadPastShifts();
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private loadPastShifts(event?: any) {
    if (!this.hasMoreShifts && event) {
      event.target.complete();
      return;
    }

    this.isLoading = true;
    this.workerService.getWorkerShiftHistory(this.worker.id, this.currentPage)
      .pipe(finalize(() => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }))
      .subscribe({
        next: (shifts) => {
          if (shifts.length === 0) {
            this.hasMoreShifts = false;
            return;
          }
          this.pastShifts = [...this.pastShifts, ...shifts];
          this.currentPage++;
        },
        error: async (error) => {
          console.error('Error loading shift history:', error);
          const toast = await this.toastController.create({
            message: 'Failed to load shift history. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
  }

  loadMoreShifts(event: any) {
    if (!this.hasMoreShifts) {
      event.target.complete();
      return;
    }
    
    this.workerService.getWorkerShiftHistory(this.worker.id, this.currentPage)
      .pipe(finalize(() => {
        event.target.complete();
      }))
      .subscribe({
        next: (shifts) => {
          if (shifts.length === 0) {
            this.hasMoreShifts = false;
            return;
          }
          this.pastShifts = [...this.pastShifts, ...shifts];
          this.currentPage++;
        },
        error: async (error) => {
          console.error('Error loading shift history:', error);
          const toast = await this.toastController.create({
            message: 'Failed to load more shifts. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
  }

  async rateShift(shift: WorkerShift) {
    // TODO: Implement rating dialog
    const toast = await this.toastController.create({
      message: 'Rating feature coming soon!',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
} 