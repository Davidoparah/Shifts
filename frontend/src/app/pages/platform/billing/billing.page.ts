import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  businessName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'commission' | 'refund';
  date: Date;
}

@Component({
  selector: 'app-billing',
  template: `
    <ion-content>
      <div class="billing-container">
        <!-- Revenue Overview -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Revenue Overview</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="stat">
                    <ion-icon name="wallet" color="success"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ monthlyRevenue | currency }}</span>
                      <span class="label">Monthly Revenue</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="stat">
                    <ion-icon name="trending-up" color="primary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ growthRate }}%</span>
                      <span class="label">Growth Rate</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="stat">
                    <ion-icon name="business" color="tertiary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ activeSubscriptions }}</span>
                      <span class="label">Active Subscriptions</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6" size-lg="3">
                  <div class="stat">
                    <ion-icon name="cash" color="warning"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ averageRevenue | currency }}</span>
                      <span class="label">Avg. Revenue/Business</span>
                    </div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Recent Transactions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Recent Transactions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let transaction of recentTransactions">
                <ion-icon 
                  [name]="getTransactionIcon(transaction.type)"
                  [color]="getTransactionColor(transaction.status)"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  <h2>{{ transaction.businessName }}</h2>
                  <p>{{ transaction.type | titlecase }}</p>
                  <ion-note>{{ transaction.date | date:'medium' }}</ion-note>
                </ion-label>
                <ion-badge 
                  [color]="getTransactionColor(transaction.status)"
                  slot="end"
                >
                  {{ transaction.amount | currency }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Subscription Plans -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Subscription Plans</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12" size-md="4">
                  <div class="plan">
                    <h3>Basic</h3>
                    <div class="price">$99<span>/month</span></div>
                    <ul>
                      <li>Up to 10 workers</li>
                      <li>Basic analytics</li>
                      <li>Email support</li>
                    </ul>
                    <ion-button expand="block" fill="outline">Edit Plan</ion-button>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="4">
                  <div class="plan featured">
                    <h3>Professional</h3>
                    <div class="price">$199<span>/month</span></div>
                    <ul>
                      <li>Up to 50 workers</li>
                      <li>Advanced analytics</li>
                      <li>Priority support</li>
                    </ul>
                    <ion-button expand="block">Edit Plan</ion-button>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="4">
                  <div class="plan">
                    <h3>Enterprise</h3>
                    <div class="price">$499<span>/month</span></div>
                    <ul>
                      <li>Unlimited workers</li>
                      <li>Custom analytics</li>
                      <li>24/7 support</li>
                    </ul>
                    <ion-button expand="block" fill="outline">Edit Plan</ion-button>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .billing-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }

    ion-card {
      margin: 16px 0;
      border-radius: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;

      ion-icon {
        font-size: 32px;
      }

      .stat-details {
        display: flex;
        flex-direction: column;

        .value {
          font-size: 24px;
          font-weight: 700;
          color: var(--ion-text-color);
        }

        .label {
          font-size: 14px;
          color: var(--ion-color-medium);
        }
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

      ion-badge {
        font-size: 14px;
        padding: 6px 12px;
      }
    }

    .plan {
      padding: 24px;
      border-radius: 16px;
      border: 1px solid var(--ion-color-light);
      height: 100%;
      display: flex;
      flex-direction: column;

      &.featured {
        border-color: var(--ion-color-primary);
        background: var(--ion-color-primary-contrast);
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 16px;
        text-align: center;
      }

      .price {
        font-size: 36px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 24px;
        color: var(--ion-color-primary);

        span {
          font-size: 16px;
          font-weight: 400;
          color: var(--ion-color-medium);
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 24px;
        flex-grow: 1;

        li {
          padding: 8px 0;
          color: var(--ion-color-medium);
          text-align: center;

          &:before {
            content: "✓";
            color: var(--ion-color-success);
            margin-right: 8px;
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class BillingPage implements OnInit {
  monthlyRevenue = 45890;
  growthRate = 24;
  activeSubscriptions = 156;
  averageRevenue = 294;

  recentTransactions: Transaction[] = [
    {
      id: '1',
      businessName: 'TechCorp Inc.',
      amount: 199,
      status: 'completed',
      type: 'subscription',
      date: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      businessName: 'Global Services Ltd.',
      amount: 450,
      status: 'completed',
      type: 'commission',
      date: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: '3',
      businessName: 'StartUp Solutions',
      amount: -50,
      status: 'completed',
      type: 'refund',
      date: new Date(Date.now() - 1000 * 60 * 60)
    }
  ];

  constructor() {}

  ngOnInit() {}

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'subscription':
        return 'card';
      case 'commission':
        return 'cash';
      case 'refund':
        return 'return-up-back';
      default:
        return 'cash';
    }
  }

  getTransactionColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'medium';
    }
  }
} 