import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalBusinesses: number;
  totalWorkers: number;
  totalShifts: number;
  activeShifts: number;
  completedShifts: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Platform Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleDarkMode()">
            <ion-icon [name]="isDarkMode ? 'sunny' : 'moon'" class="theme-toggle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [class.dark-mode]="isDarkMode">
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section" [class.dark-mode]="isDarkMode">
          <h1>Welcome to Platform Admin</h1>
          <p>Here's an overview of your platform's performance</p>
        </div>

        <!-- Stats Grid -->
        <ion-grid>
          <ion-row>
            <!-- Businesses Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="business" color="primary"></ion-icon>
                    <span>Total Businesses</span>
                  </div>
                  <div class="stat-value">{{ stats.totalBusinesses }}</div>
                  <div class="stat-footer">
                    <ion-badge color="primary">Active Platform Members</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Workers Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="people" color="secondary"></ion-icon>
                    <span>Total Workers</span>
                  </div>
                  <div class="stat-value">{{ stats.totalWorkers }}</div>
                  <div class="stat-footer">
                    <ion-badge color="secondary">Registered Workers</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Total Shifts Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="calendar" color="tertiary"></ion-icon>
                    <span>Total Shifts</span>
                  </div>
                  <div class="stat-value">{{ stats.totalShifts }}</div>
                  <div class="stat-footer">
                    <ion-badge color="tertiary">All Time</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>

          <ion-row>
            <!-- Active Shifts Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="time" color="success"></ion-icon>
                    <span>Active Shifts</span>
                  </div>
                  <div class="stat-value">{{ stats.activeShifts }}</div>
                  <div class="stat-footer">
                    <ion-badge color="success">Currently Active</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Completed Shifts Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="checkmark-circle" color="warning"></ion-icon>
                    <span>Completed Shifts</span>
                  </div>
                  <div class="stat-value">{{ stats.completedShifts }}</div>
                  <div class="stat-footer">
                    <ion-badge color="warning">Successfully Completed</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Revenue Card -->
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card [class.dark-mode]="isDarkMode" class="stat-card">
                <ion-card-content>
                  <div class="stat-header">
                    <ion-icon name="cash" color="danger"></ion-icon>
                    <span>Total Revenue</span>
                  </div>
                  <div class="stat-value">\${{ stats.revenue.toLocaleString() }}</div>
                  <div class="stat-footer">
                    <ion-badge color="danger">Platform Revenue</ion-badge>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="isLoading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading dashboard data...</p>
        </div>
      </div>

      <!-- Refresh Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="loadStats()" [disabled]="isLoading">
          <ion-icon name="refresh"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    :host {
      --stat-card-radius: 16px;
      --stat-icon-size: 24px;
      --stat-value-size: 36px;
      --welcome-section-height: 120px;
    }

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }

    .welcome-section {
      background: var(--ion-color-primary);
      color: white;
      padding: 24px;
      border-radius: var(--stat-card-radius);
      margin-bottom: 24px;
      height: var(--welcome-section-height);
      display: flex;
      flex-direction: column;
      justify-content: center;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      p {
        margin: 8px 0 0;
        opacity: 0.9;
      }

      &.dark-mode {
        background: var(--ion-color-primary-shade);
      }
    }

    .stat-card {
      margin: 8px;
      border-radius: var(--stat-card-radius);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      height: calc(100% - 16px);
      background: var(--ion-card-background);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.dark-mode {
        background: var(--ion-background-color-step-100);
      }
    }

    .stat-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      ion-icon {
        font-size: var(--stat-icon-size);
        margin-right: 12px;
      }

      span {
        color: var(--ion-color-medium);
        font-size: 14px;
        font-weight: 500;
      }
    }

    .stat-value {
      font-size: var(--stat-value-size);
      font-weight: 700;
      color: var(--ion-text-color);
      margin: 16px 0;
      line-height: 1.2;
    }

    .stat-footer {
      margin-top: 16px;

      ion-badge {
        font-size: 12px;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 12px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: var(--ion-color-medium);

      ion-spinner {
        margin-bottom: 16px;
      }
    }

    .theme-toggle {
      font-size: 24px;
      transition: transform 0.3s ease;

      &:hover {
        transform: rotate(30deg);
      }
    }

    ion-content.dark-mode {
      --ion-background-color: var(--ion-background-color-step-50);
      
      .stat-card {
        --ion-card-background: var(--ion-background-color-step-100);
      }

      .stat-value {
        color: var(--ion-color-light);
      }
    }

    @media (max-width: 768px) {
      .welcome-section {
        height: auto;
        padding: 16px;

        h1 {
          font-size: 20px;
        }
      }

      .stat-value {
        font-size: 28px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalBusinesses: 0,
    totalWorkers: 0,
    totalShifts: 0,
    activeShifts: 0,
    completedShifts: 0,
    revenue: 0
  };

  isDarkMode = false;
  isLoading = false;
  private darkModeSubscription: Subscription | undefined;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.darkModeSubscription = this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnDestroy() {
    if (this.darkModeSubscription) {
      this.darkModeSubscription.unsubscribe();
    }
  }

  loadStats() {
    this.isLoading = true;
    const headers = this.getHeaders();
    this.http.get<DashboardStats>(`${environment.apiUrl}/platform/dashboard/stats`, { headers })
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.isLoading = false;
        }
      });
  }

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
} 