import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/business/shifts">
              <ion-card-header>
                <ion-card-title>Shifts</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                Manage your shifts and schedules
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/business/workers">
              <ion-card-header>
                <ion-card-title>Workers</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                View and manage workers
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/business/applications">
              <ion-card-header>
                <ion-card-title>Applications</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                Review worker applications
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/business/reports">
              <ion-card-header>
                <ion-card-title>Reports</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                View business analytics and reports
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    ion-card-title {
      font-size: 1.2rem;
      font-weight: 600;
    }

    ion-card-content {
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    @media (prefers-color-scheme: dark) {
      ion-card {
        --background: var(--ion-color-step-100);
      }

      ion-card-content {
        color: var(--ion-color-light-shade);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
} 