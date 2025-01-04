import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <!-- Business Profile -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Business Profile</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label position="stacked">Business Name</ion-label>
            <ion-input [(ngModel)]="settings.businessName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Contact Email</ion-label>
            <ion-input type="email" [(ngModel)]="settings.email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Phone Number</ion-label>
            <ion-input type="tel" [(ngModel)]="settings.phone"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Address</ion-label>
            <ion-textarea [(ngModel)]="settings.address"></ion-textarea>
          </ion-item>
        </ion-item-group>

        <!-- Notification Settings -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Notifications</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label>New Applications</ion-label>
            <ion-toggle [(ngModel)]="settings.notifications.applications"></ion-toggle>
          </ion-item>
          <ion-item>
            <ion-label>Shift Updates</ion-label>
            <ion-toggle [(ngModel)]="settings.notifications.shifts"></ion-toggle>
          </ion-item>
          <ion-item>
            <ion-label>Worker Messages</ion-label>
            <ion-toggle [(ngModel)]="settings.notifications.messages"></ion-toggle>
          </ion-item>
        </ion-item-group>

        <!-- Payment Settings -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Payment Settings</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label position="stacked">Default Hourly Rate</ion-label>
            <ion-input type="number" [(ngModel)]="settings.defaultRate"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Payment Method</ion-label>
            <ion-select [(ngModel)]="settings.paymentMethod">
              <ion-select-option value="direct_deposit">Direct Deposit</ion-select-option>
              <ion-select-option value="paypal">PayPal</ion-select-option>
              <ion-select-option value="check">Check</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-item-group>

        <!-- Save Button -->
        <div class="ion-padding">
          <ion-button expand="block" (click)="saveSettings()">
            Save Changes
          </ion-button>
        </div>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item-divider {
      --background: var(--ion-color-light);
      --padding-start: 16px;
      margin-top: 16px;
    }
    ion-button {
      margin-top: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  settings = {
    businessName: '',
    email: '',
    phone: '',
    address: '',
    notifications: {
      applications: true,
      shifts: true,
      messages: true
    },
    defaultRate: 25,
    paymentMethod: 'direct_deposit'
  };

  constructor() {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // TODO: Implement settings loading logic
    this.settings = {
      businessName: 'Sample Business',
      email: 'business@example.com',
      phone: '(555) 123-4567',
      address: '123 Business St\nCity, State 12345',
      notifications: {
        applications: true,
        shifts: true,
        messages: true
      },
      defaultRate: 25,
      paymentMethod: 'direct_deposit'
    };
  }

  saveSettings() {
    // TODO: Implement settings saving logic
    console.log('Saving settings:', this.settings);
  }
} 