import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService, Shift } from '../../../services/shift.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Quick Stats -->
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Today's Shifts</ion-card-subtitle>
                <ion-card-title>{{ todayShifts.length }}</ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Pending Applications</ion-card-subtitle>
                <ion-card-title>{{ pendingApplications }}</ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Today's Schedule -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Today's Schedule</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let shift of todayShifts">
              <ion-label>
                <h2>{{ shift.business }}</h2>
                <h3>{{ formatTimeRange(shift.start_time, shift.end_time) }}</h3>
                <p>{{ shift.location }}</p>
                <ion-badge [color]="getStatusColor(shift.status)">
                  {{ shift.status }}
                </ion-badge>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="todayShifts.length === 0">
              <ion-label class="ion-text-center">
                <p>No shifts scheduled for today</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Quick Actions -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Quick Actions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item button routerLink="/business/shifts" detail>
              <ion-icon name="add-circle-outline" slot="start"></ion-icon>
              <ion-label>Create New Shift</ion-label>
            </ion-item>
            <ion-item button routerLink="/business/applications" detail>
              <ion-icon name="people-outline" slot="start"></ion-icon>
              <ion-label>Review Applications</ion-label>
            </ion-item>
            <ion-item button routerLink="/business/schedule" detail>
              <ion-icon name="calendar-outline" slot="start"></ion-icon>
              <ion-label>View Schedule</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {
  todayShifts: Shift[] = [];
  pendingApplications = 0;

  constructor(private shiftService: ShiftService) {}

  ngOnInit() {
    this.loadTodayShifts();
  }

  loadTodayShifts() {
    this.shiftService.getShifts().subscribe(
      shifts => {
        const today = new Date();
        this.todayShifts = shifts.filter(shift => {
          const shiftDate = new Date(shift.start_time);
          return shiftDate.toDateString() === today.toDateString();
        });

        // Count pending applications (shifts with 'applied' status)
        this.pendingApplications = shifts.filter(s => s.status === 'applied').length;
      },
      error => {
        console.error('Error loading shifts:', error);
      }
    );
  }

  formatTimeRange(start: string, end: string): string {
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