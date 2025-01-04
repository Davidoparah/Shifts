import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon name="home"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="shifts" href="/tabs/shifts">
          <ion-icon name="calendar"></ion-icon>
          <ion-label>Shifts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="schedule" href="/tabs/schedule">
          <ion-icon name="time"></ion-icon>
          <ion-label>Schedule</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon name="settings"></ion-icon>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: var(--ion-background-color);
      border-top: 1px solid var(--ion-border-color);
      height: 60px;
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
      --padding-bottom: 8px;
      --padding-top: 8px;

      ion-icon {
        font-size: 24px;
      }

      ion-label {
        font-size: 12px;
        font-weight: 500;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TabsPage {} 