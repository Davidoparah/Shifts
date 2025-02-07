import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-worker',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="flex-between">
            <div class="flex-center">
              <ion-icon name="briefcase-outline" class="logo-icon"></ion-icon>
              <span class="text-xl font-semibold">Worker Dashboard</span>
            </div>
            <ion-buttons slot="end">
              <ion-button (click)="openNotifications()">
                <ion-icon slot="icon-only" name="notifications-outline" size="large"></ion-icon>
                <ion-badge *ngIf="notificationCount > 0" color="danger">{{ notificationCount }}</ion-badge>
              </ion-button>
              <ion-button (click)="openChat()">
                <ion-icon slot="icon-only" name="chatbubbles-outline" size="large"></ion-icon>
                <ion-badge *ngIf="unreadMessages > 0" color="danger">{{ unreadMessages }}</ion-badge>
              </ion-button>
            </ion-buttons>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>

    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="available-shifts" href="/worker/available-shifts">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Available</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="my-shifts" href="/worker/my-shifts">
          <ion-icon name="time-outline"></ion-icon>
          <ion-label>My Shifts</ion-label>
          <ion-badge *ngIf="activeShifts > 0" color="primary">{{ activeShifts }}</ion-badge>
        </ion-tab-button>

        <ion-tab-button tab="earnings" href="/worker/earnings">
          <ion-icon name="wallet-outline"></ion-icon>
          <ion-label>Earnings</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="incidents" href="/worker/incidents">
          <ion-icon name="warning-outline"></ion-icon>
          <ion-label>Incidents</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/worker/profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <!-- Quick Actions FAB -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
      <ion-fab-list side="top">
        <ion-fab-button (click)="reportIncident()" color="danger">
          <ion-icon name="warning"></ion-icon>
        </ion-fab-button>
        <ion-fab-button (click)="startChat()" color="primary">
          <ion-icon name="chatbubbles"></ion-icon>
        </ion-fab-button>
        <ion-fab-button (click)="viewMap()" color="success">
          <ion-icon name="location"></ion-icon>
        </ion-fab-button>
      </ion-fab-list>
    </ion-fab>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    ion-header {
      ion-toolbar {
        --background: var(--ion-color-light);
        --border-width: 0;
        box-shadow: var(--app-box-shadow);
      }
    }

    .logo-icon {
      font-size: 24px;
      margin-right: 8px;
      color: var(--ion-color-primary);
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .flex-center {
      display: flex;
      align-items: center;
    }

    ion-badge {
      position: absolute;
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }

    ion-tab-bar {
      --background: var(--ion-color-light);
      border-top: 1px solid var(--ion-color-light-shade);
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
      
      ion-icon {
        font-size: 24px;
      }

      ion-label {
        font-size: 12px;
        font-weight: 500;
      }

      &[aria-selected="true"] {
        ion-label {
          font-weight: 600;
        }
      }
    }

    ion-fab {
      margin-bottom: calc(env(safe-area-inset-bottom) + 56px);
    }

    ion-fab-button {
      --box-shadow: var(--app-box-shadow);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class WorkerPage implements OnInit {
  notificationCount = 0;
  unreadMessages = 0;
  activeShifts = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize notifications, messages, and active shifts
    this.loadNotifications();
    this.loadMessages();
    this.loadActiveShifts();
  }

  private loadNotifications() {
    // TODO: Implement notification loading
    this.notificationCount = 2;
  }

  private loadMessages() {
    // TODO: Implement message loading
    this.unreadMessages = 3;
  }

  private loadActiveShifts() {
    // TODO: Implement active shifts loading
    this.activeShifts = 1;
  }

  openNotifications() {
    this.router.navigate(['/worker/notifications']);
  }

  openChat() {
    this.router.navigate(['/worker/chat']);
  }

  reportIncident() {
    this.router.navigate(['/worker/incidents/report']);
  }

  startChat() {
    this.router.navigate(['/worker/chat/new']);
  }

  viewMap() {
    this.router.navigate(['/worker/map']);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 