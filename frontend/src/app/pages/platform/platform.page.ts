import { Component } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-platform',
  template: `
    <ion-menu contentId="platform-content" type="overlay">
      <ion-header>
        <ion-toolbar>
          <ion-title>Platform Admin</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-item routerLink="/platform/dashboard" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="grid-outline" slot="start"></ion-icon>
            <ion-label>Dashboard</ion-label>
          </ion-item>

          <ion-item routerLink="/platform/businesses" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="business-outline" slot="start"></ion-icon>
            <ion-label>Businesses</ion-label>
          </ion-item>

          <ion-item routerLink="/platform/workers" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            <ion-label>Workers</ion-label>
          </ion-item>

          <ion-item routerLink="/platform/shifts" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            <ion-label>All Shifts</ion-label>
          </ion-item>

          <ion-item routerLink="/platform/analytics" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
            <ion-label>Analytics</ion-label>
          </ion-item>

          <ion-item routerLink="/platform/settings" routerLinkActive="selected" (click)="closeMenu()">
            <ion-icon name="settings-outline" slot="start"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-item>
        </ion-list>

        <!-- Logout Button -->
        <ion-list class="logout-section">
          <ion-item button (click)="logout()" color="light">
            <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <div class="ion-page" id="platform-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button autoHide="false"></ion-menu-button>
          </ion-buttons>
          <ion-title>Platform Admin</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-router-outlet></ion-router-outlet>
      </ion-content>
    </div>
  `,
  styles: [`
    :host {
      --menu-width: 280px;
    }

    ion-menu {
      --width: var(--menu-width);
    }

    .selected {
      --background: var(--ion-color-light);
      font-weight: bold;
    }

    ion-menu ion-content {
      --background: var(--ion-item-background);
    }

    ion-menu ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --border-radius: 8px;
      margin: 8px;
      cursor: pointer;
    }

    ion-menu ion-item ion-icon {
      color: var(--ion-color-medium);
      margin-right: 8px;
      font-size: 20px;
    }

    ion-menu ion-item.selected {
      --background: var(--ion-color-primary-light);
      --color: var(--ion-color-primary);
      font-weight: 500;
    }

    ion-menu ion-item.selected ion-icon {
      color: var(--ion-color-primary);
    }

    .logout-section {
      position: absolute;
      bottom: 0;
      width: 100%;
      border-top: 1px solid var(--ion-color-light);
      padding-top: 8px;
      padding-bottom: 8px;
    }

    @media (prefers-color-scheme: dark) {
      ion-menu ion-item {
        --background: var(--ion-color-step-100);
        --color: var(--ion-color-light);
      }

      ion-menu ion-item.selected {
        --background: var(--ion-color-primary-shade);
        --color: var(--ion-color-light);
      }

      ion-menu ion-item.selected ion-icon {
        color: var(--ion-color-light);
      }

      .logout-section {
        border-top-color: var(--ion-color-step-150);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class PlatformPage {
  constructor(
    private router: Router,
    private authService: AuthService,
    private menuController: MenuController
  ) {}

  async closeMenu() {
    await this.menuController.close();
  }

  async logout() {
    await this.menuController.close();
    await this.authService.logout();
    this.router.navigate(['/auth']);
  }
} 