import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { WorkerService, Worker } from '../../../services/worker.service';
import { FormsModule } from '@angular/forms';
import { WorkerHistoryComponent } from './worker-history.component';
import { WorkerProfileComponent } from './worker-profile.component';

@Component({
  selector: 'app-workers',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Workers</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Statistics Cards -->
      <ion-grid>
        <ion-row>
          <ion-col size="6" size-md="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="people" color="primary"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ getActiveWorkersCount() }}</h2>
                    <p>Active Workers</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" size-md="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="calendar" color="success"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ getTotalShiftsCompleted() }}</h2>
                    <p>Total Shifts</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" size-md="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="time" color="warning"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ getScheduledWorkersCount() }}</h2>
                    <p>Scheduled Today</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6" size-md="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="star" color="tertiary"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ getAverageRating() | number:'1.1-1' }}⭐</h2>
                    <p>Avg Rating</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Workers List -->
      <ion-list>
        <!-- Currently Working Section -->
        <ion-list-header>
          <ion-label>Currently Working</ion-label>
        </ion-list-header>
        
        <ion-item-sliding *ngFor="let worker of getCurrentlyWorkingWorkers()">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ worker.name }}</h2>
              <p>{{ worker.email }}</p>
              <p *ngIf="worker.current_shift" class="shift-details">
                <ion-icon name="location-outline"></ion-icon>
                {{ worker.current_shift.location }}
                <br>
                <ion-icon name="time-outline"></ion-icon>
                {{ formatTime(worker.current_shift.start_time) }} - {{ formatTime(worker.current_shift.end_time) }}
              </p>
              <ion-badge color="success">On Shift</ion-badge>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewProfile(worker)">
              <ion-icon slot="icon-only" name="person"></ion-icon>
            </ion-item-option>
            <ion-item-option color="secondary" (click)="viewHistory(worker)">
              <ion-icon slot="icon-only" name="time"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="getCurrentlyWorkingWorkers().length === 0">
          <ion-label class="ion-text-center">
            <p>No workers currently on shift</p>
          </ion-label>
        </ion-item>

        <!-- Upcoming Shifts Section -->
        <ion-list-header>
          <ion-label>Upcoming Shifts</ion-label>
        </ion-list-header>

        <ion-item-sliding *ngFor="let worker of getUpcomingShiftWorkers()">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ worker.name }}</h2>
              <p>{{ worker.email }}</p>
              <div *ngFor="let shift of worker.upcoming_shifts" class="shift-details">
                <p>
                  <ion-icon name="location-outline"></ion-icon>
                  {{ shift.location }}
                  <br>
                  <ion-icon name="time-outline"></ion-icon>
                  {{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}
                </p>
              </div>
              <ion-badge color="warning">Scheduled</ion-badge>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewProfile(worker)">
              <ion-icon slot="icon-only" name="person"></ion-icon>
            </ion-item-option>
            <ion-item-option color="secondary" (click)="viewHistory(worker)">
              <ion-icon slot="icon-only" name="time"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="getUpcomingShiftWorkers().length === 0">
          <ion-label class="ion-text-center">
            <p>No upcoming shifts scheduled</p>
          </ion-label>
        </ion-item>

        <!-- Other Workers Section -->
        <ion-list-header>
          <ion-label>Other Workers</ion-label>
        </ion-list-header>

        <ion-item-sliding *ngFor="let worker of getOtherWorkers()">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ worker.name }}</h2>
              <p>{{ worker.email }}</p>
              <p>Shifts completed: {{ worker.shifts_completed }}</p>
              <p *ngIf="worker.rating">Rating: {{ worker.rating.toFixed(1) }} ⭐</p>
              <ion-badge [color]="getStatusColor(worker)">{{ worker.status }}</ion-badge>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewProfile(worker)">
              <ion-icon slot="icon-only" name="person"></ion-icon>
            </ion-item-option>
            <ion-item-option color="secondary" (click)="viewHistory(worker)">
              <ion-icon slot="icon-only" name="time"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="inviteWorker()">
          <ion-icon name="person-add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .stat-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-container ion-icon {
      font-size: 2rem;
    }

    .stat-details h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .stat-details p {
      margin: 4px 0 0;
      color: var(--ion-color-medium);
    }

    ion-badge {
      margin-top: 8px;
    }

    ion-avatar {
      width: 48px;
      height: 48px;
    }

    .shift-details {
      margin: 8px 0;
      font-size: 0.9em;
      color: var(--ion-color-medium);
    }

    .shift-details ion-icon {
      vertical-align: middle;
      margin-right: 4px;
    }

    ion-list-header {
      margin-top: 16px;
      font-size: 1.1em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      --color: var(--ion-color-medium);
    }

    @media (prefers-color-scheme: dark) {
      .stat-details p {
        color: var(--ion-color-medium-shade);
      }
      
      .shift-details {
        color: var(--ion-color-medium-shade);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WorkersPage implements OnInit {
  workers: Worker[] = [];

  constructor(
    private workerService: WorkerService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadWorkers();
  }

  async loadWorkers() {
    try {
      const workers = await this.workerService.getBusinessWorkers().toPromise();
      this.workers = workers || [];
    } catch (error) {
      console.error('Error loading workers:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load workers',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  getActiveWorkersCount(): number {
    return this.workers.filter(w => w.status === 'active').length;
  }

  getTotalShiftsCompleted(): number {
    return this.workers.reduce((total, worker) => total + worker.shifts_completed, 0);
  }

  getScheduledWorkersCount(): number {
    const now = new Date();
    return this.workers.filter(worker => 
      worker.current_shift || 
      (worker.upcoming_shifts && worker.upcoming_shifts.length > 0)
    ).length;
  }

  getAverageRating(): number {
    const workersWithRating = this.workers.filter(w => w.rating !== null && w.rating !== undefined);
    if (workersWithRating.length === 0) return 0;
    
    const totalRating = workersWithRating.reduce((sum, worker) => sum + (worker.rating || 0), 0);
    return totalRating / workersWithRating.length;
  }

  getStatusColor(worker: Worker): string {
    const now = new Date();
    
    // Worker is currently on shift
    if (worker.current_shift && new Date(worker.current_shift.end_time) > now) {
      return 'success';
    }
    
    // Worker has upcoming shifts
    if (!worker.current_shift &&
        worker.upcoming_shifts &&
        worker.upcoming_shifts.length > 0 &&
        worker.upcoming_shifts.some(shift => new Date(shift.start_time) > now)) {
      return 'warning';
    }
    
    // Worker is available but no shifts
    if (!worker.current_shift &&
        (!worker.upcoming_shifts || worker.upcoming_shifts.length === 0)) {
      return worker.status === 'active' ? 'primary' : 'medium';
    }
    
    return 'medium';
  }

  async viewProfile(worker: Worker) {
    const modal = await this.modalCtrl.create({
      component: WorkerProfileComponent,
      componentProps: {
        worker: worker
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      this.loadWorkers();
    }
  }

  async viewHistory(worker: Worker) {
    const modal = await this.modalCtrl.create({
      component: WorkerHistoryComponent,
      componentProps: {
        worker: worker
      }
    });

    await modal.present();
  }

  async inviteWorker() {
    const alert = await this.alertCtrl.create({
      header: 'Invite Worker',
      message: 'Enter the email address of the worker you want to invite',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Invite',
          handler: async (data) => {
            if (data.email) {
              // TODO: Implement worker invitation
              const toast = await this.toastCtrl.create({
                message: 'Invitation sent successfully',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getCurrentlyWorkingWorkers(): Worker[] {
    const now = new Date();
    return this.workers.filter(worker => 
      worker.current_shift && new Date(worker.current_shift.end_time) > now
    );
  }

  getUpcomingShiftWorkers(): Worker[] {
    const now = new Date();
    return this.workers.filter(worker => 
      !worker.current_shift && 
      worker.upcoming_shifts && 
      worker.upcoming_shifts.length > 0 &&
      worker.upcoming_shifts.some(shift => new Date(shift.start_time) > now)
    );
  }

  getOtherWorkers(): Worker[] {
    const now = new Date();
    return this.workers.filter(worker => 
      (!worker.current_shift || new Date(worker.current_shift.end_time) <= now) &&
      (!worker.upcoming_shifts || !worker.upcoming_shifts.some(shift => new Date(shift.start_time) > now))
    );
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
} 