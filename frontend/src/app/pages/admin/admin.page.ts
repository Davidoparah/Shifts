import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  template: `
    <ion-menu contentId="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Admin Panel</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item routerLink="/admin/dashboard" routerLinkActive="selected">
            <ion-icon name="grid-outline" slot="start"></ion-icon>
            <ion-label>Dashboard</ion-label>
          </ion-item>
          <ion-item routerLink="/admin/users" routerLinkActive="selected">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            <ion-label>Users</ion-label>
          </ion-item>
          <ion-item routerLink="/admin/businesses" routerLinkActive="selected">
            <ion-icon name="business-outline" slot="start"></ion-icon>
            <ion-label>Businesses</ion-label>
          </ion-item>
          <ion-item routerLink="/admin/analytics" routerLinkActive="selected">
            <ion-icon name="bar-chart-outline" slot="start"></ion-icon>
            <ion-label>Analytics</ion-label>
          </ion-item>
          <ion-item button (click)="logout()">
            <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <div class="ion-page" id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Admin Panel</ion-title>
          <ion-buttons slot="end">
            <ion-button>
              <ion-icon slot="icon-only" name="notifications-outline"></ion-icon>
            </ion-button>
            <ion-button>
              <ion-icon slot="icon-only" name="person-circle-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-router-outlet></ion-router-outlet>
      </ion-content>
    </div>
  `,
  styles: [`
    ion-menu {
      --width: 250px;
    }

    ion-item.selected {
      --background: var(--ion-color-light);
      --color: var(--ion-color-primary);
      
      ion-icon {
        color: var(--ion-color-primary);
      }
    }

    ion-item {
      margin-bottom: 8px;
      --border-radius: 8px;
      
      ion-icon {
        margin-right: 8px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class AdminPage {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
} 