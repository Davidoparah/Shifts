import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Worker {
  _id?: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  shiftsCompleted: number;
  rating: number;
  reliability: number;
  avatar?: string;
}

interface ActionSheetButton {
  text: string;
  role?: string;
  handler?: () => void;
}

@Component({
  selector: 'app-workers',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Workers</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding *ngFor="let worker of workers">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ worker.name }}</h2>
              <p>{{ worker.email }}</p>
              <div class="stats">
                <ion-badge color="primary">{{ worker.shiftsCompleted }} shifts</ion-badge>
                <ion-badge color="success">{{ worker.rating }}/5</ion-badge>
                <ion-badge color="tertiary">{{ worker.reliability }}% reliable</ion-badge>
              </div>
            </ion-label>
            <ion-badge slot="end" [color]="worker.status === 'active' ? 'success' : 'medium'">
              {{ worker.status }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewDetails(worker)">
              <ion-icon slot="icon-only" name="eye-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option 
              [color]="worker.status === 'active' ? 'danger' : 'success'"
              (click)="toggleStatus(worker)">
              <ion-icon slot="icon-only" [name]="worker.status === 'active' ? 'pause-outline' : 'play-outline'"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="workers.length === 0">
          <ion-label class="ion-text-center">
            <p>No workers found</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>

    <ion-action-sheet
      [isOpen]="isActionSheetOpen"
      header="Worker Actions"
      [buttons]="actionSheetButtons"
      (didDismiss)="isActionSheetOpen = false">
    </ion-action-sheet>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    .stats {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    ion-badge {
      font-size: 0.8em;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WorkersPage implements OnInit {
  workers: Worker[] = [];
  isActionSheetOpen = false;
  actionSheetButtons: ActionSheetButton[] = [];
  selectedWorker?: Worker;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadWorkers();
  }

  loadWorkers() {
    this.http.get<Worker[]>(`${environment.apiUrl}/api/platform/workers`)
      .subscribe({
        next: (workers) => {
          this.workers = workers;
        },
        error: (error) => {
          console.error('Error loading workers:', error);
        }
      });
  }

  viewDetails(worker: Worker) {
    this.selectedWorker = worker;
    this.actionSheetButtons = [
      {
        text: 'View Details',
        handler: () => {
          // TODO: Implement view details
          console.log('View details:', worker);
        }
      },
      {
        text: 'View Shifts',
        handler: () => {
          // TODO: Implement view shifts
          console.log('View shifts:', worker);
        }
      },
      {
        text: worker.status === 'active' ? 'Suspend' : 'Activate',
        role: worker.status === 'active' ? 'destructive' : 'confirm',
        handler: () => {
          this.toggleStatus(worker);
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          // TODO: Implement delete
          console.log('Delete worker:', worker);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    this.isActionSheetOpen = true;
  }

  toggleStatus(worker: Worker) {
    const newStatus = worker.status === 'active' ? 'inactive' : 'active';
    this.http.patch<Worker>(
      `${environment.apiUrl}/api/platform/workers/${worker._id}/status`,
      { status: newStatus }
    ).subscribe({
      next: (updatedWorker) => {
        const index = this.workers.findIndex(w => w._id === worker._id);
        if (index !== -1) {
          this.workers[index] = updatedWorker;
        }
      },
      error: (error) => {
        console.error('Error updating worker status:', error);
      }
    });
  }
} 