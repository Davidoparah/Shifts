import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-business',
  template: `
    <ion-menu contentId="business-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-item routerLink="/business/dashboard" routerLinkActive="selected">
            <ion-icon name="grid-outline" slot="start"></ion-icon>
            <ion-label>Dashboard</ion-label>
          </ion-item>

          <ion-item routerLink="/business/shifts" routerLinkActive="selected">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            <ion-label>Shifts</ion-label>
          </ion-item>

          <ion-item routerLink="/business/workers" routerLinkActive="selected">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            <ion-label>Workers</ion-label>
          </ion-item>

          <ion-item routerLink="/business/applications" routerLinkActive="selected">
            <ion-icon name="document-text-outline" slot="start"></ion-icon>
            <ion-label>Applications</ion-label>
          </ion-item>

          <ion-item routerLink="/business/reports" routerLinkActive="selected">
            <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
            <ion-label>Reports</ion-label>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-item button (click)="logout()">
            <ion-icon name="log-out-outline" slot="start"></ion-icon>
            <ion-label>Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="business-content"></ion-router-outlet>
  `,
  styles: [`
    ion-menu {
      --width: 250px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 48px;
      cursor: pointer;

      &.selected {
        --background: var(--ion-color-primary-light);
        --color: var(--ion-color-primary);
        font-weight: 500;

        ion-icon {
          color: var(--ion-color-primary);
        }
      }
    }

    ion-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    @media (prefers-color-scheme: dark) {
      ion-item.selected {
        --background: var(--ion-color-primary-shade);
        --color: var(--ion-color-light);

        ion-icon {
          color: var(--ion-color-light);
        }
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class BusinessPage {
  constructor(private authService: AuthService) {}

  async logout() {
    await this.authService.logout().toPromise();
  }
} 