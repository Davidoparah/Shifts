import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  template: `
    <ion-content>
      <div class="settings-container">
        <!-- General Settings -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>General Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="globe" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h2>Platform Language</h2>
                  <p>Select your preferred language</p>
                </ion-label>
                <ion-select [(ngModel)]="language" interface="popover">
                  <ion-select-option value="en">English</ion-select-option>
                  <ion-select-option value="es">Spanish</ion-select-option>
                  <ion-select-option value="fr">French</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-icon name="time" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h2>Time Zone</h2>
                  <p>Set your local time zone</p>
                </ion-label>
                <ion-select [(ngModel)]="timezone" interface="popover">
                  <ion-select-option value="UTC">UTC</ion-select-option>
                  <ion-select-option value="EST">EST</ion-select-option>
                  <ion-select-option value="PST">PST</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-icon name="notifications" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h2>Email Notifications</h2>
                  <p>Receive platform updates via email</p>
                </ion-label>
                <ion-toggle [(ngModel)]="emailNotifications" slot="end"></ion-toggle>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Security Settings -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Security Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item button detail>
                <ion-icon name="key" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h2>Change Password</h2>
                  <p>Update your account password</p>
                </ion-label>
              </ion-item>

              <ion-item button detail>
                <ion-icon name="shield" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h2>Two-Factor Authentication</h2>
                  <p>Enable additional security</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="lock-closed" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h2>Session Timeout</h2>
                  <p>Auto-logout after inactivity</p>
                </ion-label>
                <ion-select [(ngModel)]="sessionTimeout" interface="popover">
                  <ion-select-option value="15">15 minutes</ion-select-option>
                  <ion-select-option value="30">30 minutes</ion-select-option>
                  <ion-select-option value="60">1 hour</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- API Settings -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>API Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item button detail>
                <ion-icon name="key" slot="start" color="tertiary"></ion-icon>
                <ion-label>
                  <h2>API Keys</h2>
                  <p>Manage your API keys</p>
                </ion-label>
              </ion-item>

              <ion-item button detail>
                <ion-icon name="code" slot="start" color="tertiary"></ion-icon>
                <ion-label>
                  <h2>Webhooks</h2>
                  <p>Configure webhook endpoints</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="speedometer" slot="start" color="tertiary"></ion-icon>
                <ion-label>
                  <h2>Rate Limiting</h2>
                  <p>API request limits</p>
                </ion-label>
                <ion-select [(ngModel)]="rateLimit" interface="popover">
                  <ion-select-option value="1000">1,000 req/hour</ion-select-option>
                  <ion-select-option value="5000">5,000 req/hour</ion-select-option>
                  <ion-select-option value="10000">10,000 req/hour</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Data Management -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Data Management</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item button detail>
                <ion-icon name="cloud-download" slot="start" color="success"></ion-icon>
                <ion-label>
                  <h2>Export Data</h2>
                  <p>Download platform data</p>
                </ion-label>
              </ion-item>

              <ion-item button detail>
                <ion-icon name="trash" slot="start" color="danger"></ion-icon>
                <ion-label>
                  <h2>Delete Account</h2>
                  <p>Permanently remove account</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .settings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
    }

    ion-card {
      margin: 16px 0;
      border-radius: 16px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --border-radius: 8px;
      margin: 8px 0;

      h2 {
        font-weight: 500;
        margin-bottom: 4px;
      }

      p {
        color: var(--ion-color-medium);
      }

      ion-icon {
        font-size: 24px;
      }
    }

    ion-select {
      max-width: 200px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  // General Settings
  language = 'en';
  timezone = 'UTC';
  emailNotifications = true;

  // Security Settings
  sessionTimeout = '30';

  // API Settings
  rateLimit = '5000';

  constructor() {}

  ngOnInit() {}
} 