import { Component } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-business-owner',
  template: `
    <ion-split-pane contentId="business-content" when="md">
      <ion-menu contentId="business-content" type="overlay">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title>
              <div class="flex-center">
                <ion-icon name="business-outline" class="logo-icon"></ion-icon>
                <span class="text-xl font-semibold">Business Dashboard</span>
              </div>
            </ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <div class="menu-content">
            <ion-list lines="none">
              <ion-menu-toggle auto-hide="false">
                <ion-item routerLink="/business-owner/dashboard" routerLinkActive="selected" detail="false">
                  <ion-icon name="grid-outline" slot="start"></ion-icon>
                  <ion-label class="text-base">Dashboard</ion-label>
                </ion-item>

                <ion-item routerLink="/business-owner/shifts" routerLinkActive="selected" detail="false">
                  <ion-icon name="calendar-outline" slot="start"></ion-icon>
                  <ion-label class="text-base">Manage Shifts</ion-label>
                </ion-item>

                <ion-item routerLink="/business-owner/workers" routerLinkActive="selected" detail="false">
                  <ion-icon name="people-outline" slot="start"></ion-icon>
                  <ion-label class="text-base">Workers</ion-label>
                </ion-item>

                <ion-item routerLink="/business-owner/applications" routerLinkActive="selected" detail="false">
                  <ion-icon name="document-text-outline" slot="start"></ion-icon>
                  <ion-label class="text-base">Applications</ion-label>
                </ion-item>

                <ion-item routerLink="/business-owner/profile" routerLinkActive="selected" detail="false">
                  <ion-icon name="business-outline" slot="start"></ion-icon>
                  <ion-label class="text-base">Business Profile</ion-label>
                </ion-item>

                <ion-item routerLink="/business-owner/settings" routerLinkActive="selected" detail="false">
                  <ion-icon name="settings-outline" slot="start"></ion-icon>
                  <ion-label>Settings</ion-label>
                </ion-item>
              </ion-menu-toggle>
            </ion-list>

            <div class="logout-section">
              <ion-item button (click)="logout()" detail="false" class="logout-button">
                <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
                <ion-label color="danger" class="text-base">Logout</ion-label>
              </ion-item>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="business-content">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
            <ion-title>
              <div class="flex-between">
                <ion-breadcrumb class="text-lg font-medium">Business Dashboard</ion-breadcrumb>
                <div class="flex-center">
                  <ion-button fill="clear">
                    <ion-icon slot="icon-only" name="notifications-outline" size="large"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear">
                    <ion-avatar slot="icon-only">
                      <img src="assets/avatar-placeholder.png" alt="Business avatar">
                    </ion-avatar>
                  </ion-button>
                </div>
              </div>
            </ion-title>
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
        --color: var(--app-text);
      }
    }

    .logo-icon {
      font-size: var(--font-size-2xl);
      margin-right: var(--spacing-sm);
      color: var(--app-primary);
    }

    .menu-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--menu-padding);
      background: var(--app-surface);
    }

    ion-list {
      background: transparent;
      padding: 0;
      margin: var(--spacing-md) 0;
    }

    ion-item {
      --background: transparent;
      --background-hover: var(--color-gray-100);
      --background-activated: var(--color-gray-100);
      --padding-start: var(--spacing-md);
      --padding-end: var(--spacing-md);
      --border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-xs);
      --color: var(--app-text);
      
      &.selected {
        --background: var(--app-primary-light);
        --color: var(--app-primary);
        font-weight: var(--font-weight-semibold);

        ion-icon {
          color: var(--app-primary);
        }
      }

      ion-icon {
        font-size: var(--font-size-xl);
        margin-right: var(--spacing-sm);
        color: var(--app-text-light);
      }

      ion-label {
        font-weight: var(--font-weight-medium);
      }
    }

    .logout-section {
      margin-top: auto;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--app-border);
    }

    .logout-button {
      --background: var(--color-gray-50);
      margin-bottom: 0;
    }

    ion-header {
      ion-toolbar {
        --background: var(--app-surface);
        --border-width: 0;
        --color: var(--app-text);
        box-shadow: var(--shadow-sm);
      }

      ion-avatar {
        width: 35px;
        height: 35px;
        border: 2px solid var(--app-primary);
      }

      ion-button {
        --color: var(--app-text-light);
        margin: 0 var(--spacing-xs);
      }
    }

    @media (prefers-color-scheme: dark) {
      ion-menu ion-toolbar,
      ion-header ion-toolbar {
        --background: var(--app-surface);
        --color: var(--app-text);
      }

      ion-item {
        --background-hover: var(--color-gray-800);
        --background-activated: var(--color-gray-800);
      }

      .logout-button {
        --background: var(--color-gray-800);
      }

      .logout-section {
        border-top-color: var(--app-border);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class BusinessOwnerPage {
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
    this.router.navigate(['/auth/login']);
  }
} 