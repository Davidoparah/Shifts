import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Shift } from '../../../services/shift.service';

@Component({
  selector: 'app-shifts-list',
  template: `
    <ion-list *ngIf="hasShifts()">
      <ion-item-group *ngFor="let group of groupedShifts | keyvalue">
        <ion-item-divider sticky>
          <ion-label>{{ group.key }}</ion-label>
        </ion-item-divider>

        <ion-item-sliding *ngFor="let shift of group.value">
          <ion-item>
            <ion-label>
              <h2>{{ shift.location }}</h2>
              <p>
                <ion-icon name="time-outline"></ion-icon>
                {{ formatTime(shift.start_time) }} - {{ formatTime(shift.end_time) }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ shift.rate | currency }}/hr
              </p>
              <!-- Assigned Worker Information -->
              <div *ngIf="shift.assigned_worker" class="worker-info">
                <ion-chip color="success">
                  <ion-avatar>
                    <img [src]="shift.assigned_worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
                  </ion-avatar>
                  <ion-label>{{ shift.assigned_worker.name }}</ion-label>
                  <ion-icon name="checkmark-circle"></ion-icon>
                </ion-chip>
                <p class="worker-stats" *ngIf="shift.assigned_worker.rating">
                  <ion-icon name="star"></ion-icon>
                  {{ shift.assigned_worker.rating.toFixed(1) }}
                  <ion-icon name="checkmark-done" class="separator"></ion-icon>
                  {{ shift.assigned_worker.shifts_completed }} shifts completed
                </p>
              </div>
              <div *ngIf="!shift.assigned_worker" class="no-worker">
                <ion-chip color="warning">
                  <ion-icon name="hourglass-outline"></ion-icon>
                  <ion-label>Unassigned</ion-label>
                </ion-chip>
              </div>
              <ion-badge [color]="getStatusColor(shift.status)" class="status-badge">
                {{ shift.status }}
              </ion-badge>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="onEdit.emit(shift)">
              <ion-icon slot="icon-only" name="create"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="onDelete.emit(shift)">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-item-group>
    </ion-list>

    <div *ngIf="!hasShifts()" class="ion-text-center ion-padding">
      <ion-text color="medium">
        <p>No shifts found</p>
      </ion-text>
    </div>
  `,
  styles: [`
    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
      font-weight: 600;
    }

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

    .status-badge {
      margin-top: 8px;
      text-transform: capitalize;
    }

    .worker-info {
      margin-top: 12px;
    }

    .worker-stats {
      font-size: 0.9em;
      color: var(--ion-color-medium);
      margin-top: 4px;
    }

    .worker-stats ion-icon {
      color: var(--ion-color-warning);
    }

    .worker-stats .separator {
      margin: 0 8px;
      color: var(--ion-color-medium);
    }

    ion-chip {
      margin: 8px 0;
    }

    ion-chip ion-avatar {
      width: 24px;
      height: 24px;
      margin-right: 4px;
    }

    .no-worker {
      margin-top: 8px;
    }

    @media (prefers-color-scheme: dark) {
      ion-item-divider {
        --background: var(--ion-color-step-150);
        --color: var(--ion-color-light);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShiftsListComponent {
  @Input() groupedShifts!: { [key: string]: Shift[] };
  @Output() onEdit = new EventEmitter<Shift>();
  @Output() onDelete = new EventEmitter<Shift>();

  hasShifts(): boolean {
    return this.groupedShifts && Object.keys(this.groupedShifts).length > 0;
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateString;
    }
  }

  getStatusColor(status: string): string {
    if (!status) return 'medium';

    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'primary';
      case 'available':
        return 'tertiary';
      default:
        return 'medium';
    }
  }
} 