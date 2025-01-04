import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Home</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleDarkMode()">
            <ion-icon
              slot="icon-only"
              [name]="isDarkMode ? 'moon' : 'moon-outline'"
              [ngClass]="{'theme-icon': true, 'active': isDarkMode}"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" [scrollY]="true">
      <div class="content-container">
        <!-- Welcome Section -->
        <div class="welcome-section" *ngIf="currentUser">
          <h1>Welcome, {{ currentUser.name }}!</h1>
        </div>

        <!-- Dashboard Content -->
        <ion-list>
          <ion-list-header>
            <ion-label>Your Dashboard</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            <ion-label>
              <h2>Next Shift</h2>
              <p>No upcoming shifts</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="time-outline" slot="start"></ion-icon>
            <ion-label>
              <h2>Recent Activity</h2>
              <p>No recent activity</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .content-container {
      padding: 16px;
    }

    .welcome-section {
      margin-bottom: 24px;
      
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--ion-text-color);
      }
    }

    ion-list {
      background: transparent;
      padding: 0;

      ion-list-header {
        padding-left: 0;
        
        ion-label {
          font-weight: 600;
          font-size: 18px;
          color: var(--ion-text-color);
        }
      }
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --background: var(--ion-item-background);
      --border-radius: 8px;
      margin-bottom: 8px;

      ion-icon {
        color: var(--ion-color-primary);
        font-size: 24px;
      }

      h2 {
        font-weight: 500;
        margin-bottom: 4px;
      }

      p {
        color: var(--ion-color-medium);
      }
    }

    .theme-icon {
      font-size: 24px;
      transition: all 0.3s ease;
      color: var(--ion-color-medium);

      &.active {
        color: var(--ion-color-warning);
        filter: drop-shadow(0 0 2px rgba(255, 196, 9, 0.3));
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  isDarkMode = false;
  currentUser: User | null = null;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Initialize theme state
    this.isDarkMode = this.themeService.getCurrentTheme();
    console.log('Initial dark mode state:', this.isDarkMode);

    // Subscribe to theme changes
    this.themeService.isDarkMode.subscribe(isDark => {
      console.log('Theme changed:', isDark);
      this.isDarkMode = isDark;
    });

    // Get current user
    this.currentUser = this.authService.currentUserValue;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleDarkMode() {
    console.log('Toggling dark mode. Current state:', this.isDarkMode);
    this.themeService.setTheme(!this.isDarkMode);
  }
} 