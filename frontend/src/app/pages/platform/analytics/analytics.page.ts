import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  template: `
    <ion-content>
      <div class="analytics-container">
        <!-- Growth Metrics -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Growth Metrics</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="metric">
                    <div class="metric-value">
                      <span class="number">+24%</span>
                      <ion-icon name="trending-up" color="success"></ion-icon>
                    </div>
                    <div class="metric-label">Business Growth</div>
                    <div class="metric-sublabel">vs. last month</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="metric">
                    <div class="metric-value">
                      <span class="number">+32%</span>
                      <ion-icon name="trending-up" color="success"></ion-icon>
                    </div>
                    <div class="metric-label">Worker Growth</div>
                    <div class="metric-sublabel">vs. last month</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="metric">
                    <div class="metric-value">
                      <span class="number">+18%</span>
                      <ion-icon name="trending-up" color="success"></ion-icon>
                    </div>
                    <div class="metric-label">Shift Growth</div>
                    <div class="metric-sublabel">vs. last month</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="metric">
                    <div class="metric-value">
                      <span class="number">+28%</span>
                      <ion-icon name="trending-up" color="success"></ion-icon>
                    </div>
                    <div class="metric-label">Revenue Growth</div>
                    <div class="metric-sublabel">vs. last month</div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Key Performance Indicators -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Key Performance Indicators</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h2>Average Shift Fill Rate</h2>
                  <p>Percentage of shifts filled successfully</p>
                </ion-label>
                <ion-badge color="success" slot="end">92%</ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Worker Retention Rate</h2>
                  <p>Workers staying active for 3+ months</p>
                </ion-label>
                <ion-badge color="primary" slot="end">85%</ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Business Satisfaction</h2>
                  <p>Average rating from businesses</p>
                </ion-label>
                <ion-badge color="warning" slot="end">4.8/5</ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h2>Worker Satisfaction</h2>
                  <p>Average rating from workers</p>
                </ion-label>
                <ion-badge color="tertiary" slot="end">4.7/5</ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

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
                  <h2>{{ activity.title }}</h2>
                  <p>{{ activity.description }}</p>
                  <ion-note>{{ activity.time | date:'shortTime' }}</ion-note>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .analytics-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }

    ion-card {
      margin: 16px 0;
      border-radius: 16px;
    }

    .metric {
      text-align: center;
      padding: 16px;

      .metric-value {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;

        .number {
          font-size: 24px;
          font-weight: 700;
          color: var(--ion-text-color);
        }

        ion-icon {
          font-size: 20px;
        }
      }

      .metric-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--ion-text-color);
      }

      .metric-sublabel {
        font-size: 12px;
        color: var(--ion-color-medium);
        margin-top: 4px;
      }
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --border-radius: 8px;
      margin: 8px 0;

      h2 {
        font-weight: 500;
        margin-bottom: 4px;
      }

      p {
        color: var(--ion-color-medium);
      }

      ion-note {
        font-size: 12px;
        margin-top: 4px;
      }
    }

    ion-badge {
      font-size: 14px;
      padding: 6px 12px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AnalyticsPage implements OnInit {
  recentActivity = [
    {
      icon: 'business',
      color: 'primary',
      title: 'New Business Onboarding',
      description: 'TechCorp Inc. completed setup',
      time: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      icon: 'people',
      color: 'success',
      title: 'Worker Milestone',
      description: 'Platform reached 1000+ active workers',
      time: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      icon: 'calendar',
      color: 'warning',
      title: 'Shift Analytics',
      description: 'Monthly shift report generated',
      time: new Date(Date.now() - 1000 * 60 * 60)
    }
  ];

  constructor() {}

  ngOnInit() {}
} 