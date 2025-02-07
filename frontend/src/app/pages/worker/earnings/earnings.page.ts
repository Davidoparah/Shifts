import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EarningsService, ShiftEarning } from '../../../services/earnings.service';

@Component({
  selector: 'app-earnings',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Earnings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Earnings Summary Card -->
      <ion-card class="summary-card">
        <ion-card-content>
          <div class="earnings-header">
            <h2>Total Earnings</h2>
            <ion-segment [(ngModel)]="timeframe" (ionChange)="updateEarnings()">
              <ion-segment-button value="week">
                <ion-label>Week</ion-label>
              </ion-segment-button>
              <ion-segment-button value="month">
                <ion-label>Month</ion-label>
              </ion-segment-button>
              <ion-segment-button value="year">
                <ion-label>Year</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
          
          <div class="amount-container">
            <h1 class="total-amount">{{ totalEarnings | currency }}</h1>
            <ion-badge color="success" *ngIf="earningsChange > 0">+{{ earningsChange }}%</ion-badge>
            <ion-badge color="danger" *ngIf="earningsChange < 0">{{ earningsChange }}%</ion-badge>
          </div>

          <ion-list lines="none">
            <ion-item>
              <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Hours Worked</h3>
                <p>{{ hoursWorked }} hours</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Average Rate</h3>
                <p>{{ averageRate | currency }}/hr</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Recent Earnings -->
      <ion-list>
        <ion-list-header>
          <ion-label>Recent Shifts</ion-label>
        </ion-list-header>

        <ion-item *ngFor="let shift of recentShifts">
          <ion-label>
            <h2>{{ shift.title }}</h2>
            <p>{{ shift.date | date:'mediumDate' }}</p>
            <p>{{ shift.hours }} hours at {{ shift.rate | currency }}/hr</p>
          </ion-label>
          <ion-note slot="end" [color]="shift.status === 'completed' ? 'success' : 'medium'">
            {{ shift.earnings | currency }}
          </ion-note>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll (ionInfinite)="loadMoreShifts($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `,
  styles: [`
    .summary-card {
      background: var(--ion-color-primary);
      color: white;
      border-radius: 16px;
      margin-bottom: 20px;
    }

    .earnings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
    }

    ion-segment {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      width: auto;

      ion-segment-button {
        --color: rgba(255, 255, 255, 0.7);
        --color-checked: white;
        --indicator-color: rgba(255, 255, 255, 0.2);
      }
    }

    .amount-container {
      text-align: center;
      margin: 24px 0;

      .total-amount {
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      ion-badge {
        --padding-start: 8px;
        --padding-end: 8px;
        --padding-top: 4px;
        --padding-bottom: 4px;
      }
    }

    ion-list {
      background: transparent;

      ion-item {
        --background: transparent;
        --color: white;

        ion-icon {
          font-size: 24px;
        }

        h3 {
          font-weight: 500;
          margin-bottom: 4px;
        }

        p {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    ion-list-header {
      padding-top: 20px;
      font-size: 18px;
      font-weight: 600;
    }

    ion-note {
      font-size: 16px;
      font-weight: 600;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class EarningsPage implements OnInit {
  timeframe: 'week' | 'month' | 'year' = 'week';
  totalEarnings = 0;
  earningsChange = 0;
  hoursWorked = 0;
  averageRate = 0;
  recentShifts: ShiftEarning[] = [];
  currentPage = 1;

  constructor(private earningsService: EarningsService) {}

  ngOnInit() {
    this.updateEarnings();
    this.loadRecentShifts();
  }

  updateEarnings() {
    this.earningsService.getMockEarningsSummary(this.timeframe).subscribe(summary => {
      this.totalEarnings = summary.totalEarnings;
      this.earningsChange = summary.earningsChange;
      this.hoursWorked = summary.hoursWorked;
      this.averageRate = summary.averageRate;
    });
  }

  loadRecentShifts(event?: any) {
    this.earningsService.getMockRecentShifts().subscribe(shifts => {
      if (event) {
        this.recentShifts = [...this.recentShifts, ...shifts];
        event.target.complete();
        // Disable infinite scroll if no more data
        if (shifts.length === 0) {
          event.target.disabled = true;
        }
      } else {
        this.recentShifts = shifts;
      }
    });
  }

  loadMoreShifts(event: any) {
    this.currentPage++;
    this.loadRecentShifts(event);
  }
} 