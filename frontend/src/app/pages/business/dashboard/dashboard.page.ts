import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon slot="start" name="log-out-outline"></ion-icon>
            Logout
          </ion-button>
        </ion-buttons>
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
                <h2>{{ shift.title }}</h2>
                <h3>{{ formatTimeRange(shift.start_time, shift.end_time) }}</h3>
                <p>{{ shift.location }}</p>
                <p>Rate: {{ shift.rate | currency }}/hr</p>
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
            <ion-item button routerLink="/business/shifts/create" detail>
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
    ion-button ion-icon {
      margin-right: 8px;
    }
    ion-badge {
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DashboardPage implements OnInit {
  todayShifts: Shift[] = [];
  pendingApplications = 0;

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTodayShifts();
  }

  logout() {
    this.authService.logout();
  }

  loadTodayShifts() {
    this.shiftService.getShifts().subscribe(
      shifts => {
        const today = new Date();
        this.todayShifts = shifts.data.filter((shift: Shift) => {
          const shiftDate = new Date(shift.start_time);
          return shiftDate.toDateString() === today.toDateString();
        });

        // Count pending applications (shifts with 'assigned' status)
        this.pendingApplications = shifts.data.filter((s: Shift) => s.status === 'assigned').length;
      },
      error => {
        console.error('Error loading shifts:', error);
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
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
      case 'assigned': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }
} 