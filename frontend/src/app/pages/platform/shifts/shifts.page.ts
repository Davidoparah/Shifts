import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Shift {
  _id?: string;
  business: string;
  location: string;
  start_time: Date;
  end_time: Date;
  duration: number;
  rate: number;
  status: 'available' | 'applied' | 'confirmed' | 'completed' | 'cancelled';
  assignee?: {
    id: string;
    name: string;
  };
}

@Component({
  selector: 'app-shifts',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>All Shifts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-group *ngFor="let shift of shifts">
          <ion-item>
            <ion-label>
              <h2>{{ shift.business }}</h2>
              <h3>{{ formatTimeRange(shift.start_time, shift.end_time) }}</h3>
              <p>Location: {{ shift.location }}</p>
              <p>Rate: \${{ shift.rate }}/hr</p>
              <p *ngIf="shift.assignee">Worker: {{ shift.assignee.name }}</p>
            </ion-label>
            <ion-badge slot="end" [color]="getStatusColor(shift.status)">
              {{ shift.status }}
            </ion-badge>
          </ion-item>
        </ion-item-group>

        <ion-item *ngIf="shifts.length === 0">
          <ion-label class="ion-text-center">
            <p>No shifts found</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    ion-badge {
      margin-right: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShiftsPage implements OnInit {
  shifts: Shift[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadShifts();
  }

  loadShifts() {
    this.http.get<Shift[]>(`${environment.apiUrl}/platform/shifts`)
      .subscribe({
        next: (shifts) => {
          this.shifts = shifts;
        },
        error: (error) => {
          console.error('Error loading shifts:', error);
        }
      });
  }

  formatTimeRange(start: Date, end: Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'primary';
      case 'applied': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }
} 