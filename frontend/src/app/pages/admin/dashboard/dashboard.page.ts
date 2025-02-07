import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <!-- Users Card -->
          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Users</ion-card-title>
                <ion-card-subtitle>Total Active Users</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>{{ totalUsers }}</h2>
                <ion-button expand="block" fill="clear" routerLink="/admin/users">
                  View Details
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Businesses Card -->
          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Businesses</ion-card-title>
                <ion-card-subtitle>Registered Companies</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>{{ totalBusinesses }}</h2>
                <ion-button expand="block" fill="clear" routerLink="/admin/businesses">
                  View Details
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Workers Card -->
          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Workers</ion-card-title>
                <ion-card-subtitle>Active Workers</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>{{ totalWorkers }}</h2>
                <ion-button expand="block" fill="clear" routerLink="/admin/workers">
                  View Details
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Revenue Card -->
          <ion-col size="12" size-md="6" size-lg="3">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Revenue</ion-card-title>
                <ion-card-subtitle>Monthly Revenue</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>{{ monthlyRevenue | currency }}</h2>
                <ion-button expand="block" fill="clear" routerLink="/admin/analytics">
                  View Analytics
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Recent Activity -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Recent Activity</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let activity of recentActivity">
                    <ion-label>
                      <h3>{{ activity.description }}</h3>
                      <p>{{ activity.timestamp | date:'medium' }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
      height: 100%;
      box-shadow: var(--app-box-shadow);
    }

    ion-card-content h2 {
      font-size: 2em;
      font-weight: bold;
      margin: 16px 0;
      color: var(--ion-color-primary);
    }

    ion-list {
      background: transparent;
    }

    ion-item {
      --background: transparent;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DashboardPage implements OnInit {
  totalUsers = 0;
  totalBusinesses = 0;
  totalWorkers = 0;
  monthlyRevenue = 0;
  recentActivity: Array<{ description: string; timestamp: Date }> = [];

  constructor() {}

  ngOnInit() {
    // TODO: Implement data fetching from admin service
    this.loadMockData();
  }

  private loadMockData() {
    this.totalUsers = 150;
    this.totalBusinesses = 25;
    this.totalWorkers = 100;
    this.monthlyRevenue = 25000;

    this.recentActivity = [
      {
        description: 'New business registration: Security Corp Ltd',
        timestamp: new Date()
      },
      {
        description: 'Worker profile approved: John Smith',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        description: 'New shift posted: Night Security Guard',
        timestamp: new Date(Date.now() - 7200000)
      }
    ];
  }
} 