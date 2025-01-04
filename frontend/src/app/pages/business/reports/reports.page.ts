import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Stats {
  totalShifts: number;
  filledShifts: number;
  cancelledShifts: number;
  completedShifts: number;
  totalHours: number;
  averageRate: number;
  totalCost: number;
}

@Component({
  selector: 'app-reports',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Reports & Analytics</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Time Period Selection -->
      <ion-segment [(ngModel)]="selectedPeriod" (ionChange)="periodChanged()">
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

      <!-- Stats Cards -->
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Total Shifts</ion-card-subtitle>
                <ion-card-title>{{ stats.totalShifts }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Filled: {{ stats.filledShifts }}</p>
                <p>Cancelled: {{ stats.cancelledShifts }}</p>
                <p>Completed: {{ stats.completedShifts }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="6">
            <ion-card>
              <ion-card-header>
                <ion-card-subtitle>Total Hours</ion-card-subtitle>
                <ion-card-title>{{ stats.totalHours }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Avg Rate: \${{ stats.averageRate }}/hr</p>
                <p>Total Cost: \${{ stats.totalCost }}</p>
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
              <ion-label>
                <h2>{{ activity.title }}</h2>
                <p>{{ activity.description }}</p>
                <p>{{ formatDate(activity.timestamp) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Export Options -->
      <ion-list>
        <ion-list-header>
          <ion-label>Export Reports</ion-label>
        </ion-list-header>
        <ion-item button (click)="exportReport('pdf')">
          <ion-icon name="document-text-outline" slot="start"></ion-icon>
          <ion-label>Export as PDF</ion-label>
        </ion-item>
        <ion-item button (click)="exportReport('csv')">
          <ion-icon name="document-outline" slot="start"></ion-icon>
          <ion-label>Export as CSV</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReportsPage implements OnInit {
  selectedPeriod = 'week';
  stats: Stats = {
    totalShifts: 0,
    filledShifts: 0,
    cancelledShifts: 0,
    completedShifts: 0,
    totalHours: 0,
    averageRate: 0,
    totalCost: 0
  };
  recentActivity: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadStats();
    this.loadRecentActivity();
  }

  periodChanged() {
    this.loadStats();
  }

  loadStats() {
    // TODO: Implement stats loading logic
    this.stats = {
      totalShifts: 25,
      filledShifts: 20,
      cancelledShifts: 2,
      completedShifts: 18,
      totalHours: 150,
      averageRate: 25,
      totalCost: 3750
    };
  }

  loadRecentActivity() {
    // TODO: Implement activity loading logic
    this.recentActivity = [
      {
        title: 'Shift Completed',
        description: 'Morning shift completed by John Doe',
        timestamp: new Date()
      },
      {
        title: 'New Application',
        description: 'Jane Smith applied for Evening shift',
        timestamp: new Date()
      }
    ];
  }

  exportReport(format: 'pdf' | 'csv') {
    // TODO: Implement export logic
    console.log(`Exporting report as ${format}`);
  }

  formatDate(date: Date): string {
    return date.toLocaleString();
  }
} 