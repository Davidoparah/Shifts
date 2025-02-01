import { Component } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-platform',
  template: `
    <ion-split-pane contentId="platform-content" when="md">
      <ion-menu contentId="platform-content" type="overlay">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title>
              <div class="flex-center">
                <ion-icon name="shield-checkmark-outline" class="logo-icon"></ion-icon>
                <span>Platform Admin</span>
              </div>
            </ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <div class="menu-content">
            <ion-list lines="none">
              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/platform/dashboard" routerLinkActive="selected" detail="false">
                  <ion-icon name="grid-outline" slot="start"></ion-icon>
                  <ion-label>Dashboard</ion-label>
                </ion-item>

                <ion-item routerLink="/platform/businesses" routerLinkActive="selected" detail="false">
                  <ion-icon name="business-outline" slot="start"></ion-icon>
                  <ion-label>Businesses</ion-label>
                </ion-item>

                <ion-item routerLink="/platform/workers" routerLinkActive="selected" detail="false">
                  <ion-icon name="people-outline" slot="start"></ion-icon>
                  <ion-label>Workers</ion-label>
                </ion-item>

                <ion-item routerLink="/platform/shifts" routerLinkActive="selected" detail="false">
                  <ion-icon name="calendar-outline" slot="start"></ion-icon>
                  <ion-label>All Shifts</ion-label>
                </ion-item>

                <ion-item routerLink="/platform/analytics" routerLinkActive="selected" detail="false">
                  <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
                  <ion-label>Analytics</ion-label>
                </ion-item>

                <ion-item routerLink="/platform/settings" routerLinkActive="selected" detail="false">
                  <ion-icon name="settings-outline" slot="start"></ion-icon>
                  <ion-label>Settings</ion-label>
                </ion-item>
              </ion-menu-toggle>
            </ion-list>

            <div class="logout-section">
              <ion-item button (click)="logout()" detail="false">
                <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
                <ion-label color="danger">Logout</ion-label>
              </ion-item>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="platform-content">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
            <ion-title>
              <ion-breadcrumb>Platform Admin</ion-breadcrumb>
            </ion-title>
            <ion-buttons slot="end">
              <ion-button>
                <ion-icon slot="icon-only" name="notifications-outline"></ion-icon>
              </ion-button>
              <ion-button>
                <ion-avatar slot="icon-only">
                  <img src="assets/avatar-placeholder.png" alt="User avatar">
                </ion-avatar>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-router-outlet></ion-router-outlet>
        </ion-content>
      </div>
    </ion-split-pane>
  `,
  styles: [`
    :host {
      --menu-width: 280px;
      --menu-padding: var(--spacing-md);
    }

    ion-split-pane {
      --side-width: var(--menu-width);
    }

    ion-menu {
      --width: var(--menu-width);
      
      ion-toolbar {
        --background: var(--app-surface);
        --border-width: 0;
      }
    }

    .logo-icon {
      font-size: 24px;
      margin-right: var(--spacing-sm);
      color: var(--app-primary);
    }

    .menu-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--menu-padding);
    }

    ion-list {
      background: transparent;
      padding: 0;
      margin: var(--spacing-md) 0;
    }

    ion-item {
      --background: transparent;
      --background-hover: var(--ion-color-light);
      --background-activated: var(--ion-color-light);
      --padding-start: var(--spacing-md);
      --padding-end: var(--spacing-md);
      --border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-xs);
      
      &.selected {
        --background: var(--ion-color-primary-light);
        --color: var(--ion-color-primary);
        font-weight: 500;

        ion-icon {
          color: var(--ion-color-primary);
        }
      }

      ion-icon {
        font-size: 20px;
        margin-right: var(--spacing-sm);
        color: var(--ion-color-medium);
      }
    }

    .logout-section {
      margin-top: auto;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--ion-color-light);
    }

    ion-header {
      ion-toolbar {
        --background: var(--app-surface);
        --border-width: 0;
        box-shadow: var(--shadow-sm);
      }

      ion-avatar {
        width: 32px;
        height: 32px;
      }
    }

    @media (prefers-color-scheme: dark) {
      ion-menu ion-toolbar,
      ion-header ion-toolbar {
        --background: var(--app-surface);
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