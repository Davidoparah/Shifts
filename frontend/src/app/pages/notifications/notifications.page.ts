import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let notification of notifications">
          <ion-icon [name]="notification.icon" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ notification.title }}</h2>
            <p>{{ notification.message }}</p>
            <ion-note>{{ notification.time }}</ion-note>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class NotificationsPage {
  notifications = [
    {
      icon: 'calendar-outline',
      title: 'New Shift Available',
      message: 'A new shift has been posted in your area',
      time: '2 hours ago'
    }
  ];
} 