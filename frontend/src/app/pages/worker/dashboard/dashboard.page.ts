import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-worker-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Quick Stats -->
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="calendar" color="primary"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ upcomingShifts }}</h2>
                    <p>Upcoming Shifts</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="time" color="success"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ hoursThisWeek }}</h2>
                    <p>Hours This Week</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="cash" color="warning"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ earnings | currency }}</h2>
                    <p>Monthly Earnings</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-content>
                <div class="stat-container">
                  <ion-icon name="star" color="tertiary"></ion-icon>
                  <div class="stat-details">
                    <h2>{{ rating }}</h2>
                    <p>Rating</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Recent Activity -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Recent Activity</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let activity of recentActivity">
              <ion-icon [name]="activity.icon" slot="start" [color]="activity.color"></ion-icon>
              <ion-label>
                <h3>{{ activity.title }}</h3>
                <p>{{ activity.description }}</p>
              </ion-label>
              <ion-note slot="end">{{ activity.time }}</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px;
    }
    .stat-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-container ion-icon {
      font-size: 2.5rem;
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
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {
  upcomingShifts = 5;
  hoursThisWeek = 32;
  earnings = 2450;
  rating = 4.8;

  recentActivity = [
    {
      icon: 'checkmark-circle',
      color: 'success',
      title: 'Shift Completed',
      description: 'Coffee Shop Morning Shift',
      time: '2 hours ago'
    },
    {
      icon: 'calendar',
      color: 'primary',
      title: 'New Shift Available',
      description: 'Restaurant Evening Shift',
      time: '4 hours ago'
    },
    {
      icon: 'star',
      color: 'warning',
      title: 'New Rating Received',
      description: '5 stars from Coffee Shop',
      time: '1 day ago'
    }
  ];

  constructor() {}

  ngOnInit() {
    // In a real app, we would fetch this data from a service
  }
} 