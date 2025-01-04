import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true" [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <!-- Profile Section -->
        <ion-item-group *ngIf="currentUser">
          <ion-item lines="none">
            <ion-avatar slot="start">
              <img [src]="currentUser.avatar_url || 'assets/default-avatar.png'" alt="Profile picture">
            </ion-avatar>
            <ion-label>
              <h2>{{ currentUser.name }}</h2>
              <p>{{ currentUser.email }}</p>
            </ion-label>
          </ion-item>
        </ion-item-group>

        <!-- Appearance Settings -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Appearance</ion-label>
          </ion-item-divider>
          
          <ion-item>
            <ion-icon slot="start" [name]="isDarkMode ? 'moon' : 'sunny'" [color]="isDarkMode ? 'warning' : 'primary'"></ion-icon>
            <ion-label>
              <h2>Dark Mode</h2>
              <p>{{ isDarkMode ? 'Dark theme enabled' : 'Light theme enabled' }}</p>
            </ion-label>
            <ion-toggle 
              slot="end"
              [checked]="isDarkMode"
              (ionChange)="onThemeToggle($event)"
              mode="ios"
            ></ion-toggle>
          </ion-item>
        </ion-item-group>

        <!-- Account Actions -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Account</ion-label>
          </ion-item-divider>
          
          <ion-item button (click)="signOut()" detail="true">
            <ion-icon slot="start" name="log-out-outline" color="danger"></ion-icon>
            <ion-label color="danger">Sign Out</ion-label>
          </ion-item>
        </ion-item-group>

        <!-- About -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>About</ion-label>
          </ion-item-divider>
          
          <ion-item>
            <ion-icon slot="start" name="information-circle-outline"></ion-icon>
            <ion-label>Version</ion-label>
            <ion-note slot="end">1.0.0</ion-note>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    ion-content {
      --padding-top: 16px;
      --padding-bottom: 16px;
    }

    ion-list {
      background: transparent;
      padding: 0;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --inner-padding-end: 16px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      ion-label {
        h2 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        p {
          font-size: 14px;
          color: var(--ion-color-medium);
        }
      }
    }

    ion-item-divider {
      --padding-start: 16px;
      --background: transparent;
      --color: var(--ion-color-medium);
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    ion-avatar {
      width: 48px;
      height: 48px;
    }

    ion-icon {
      font-size: 24px;
    }

    ion-toggle {
      padding-right: 0;
    }

    .profile-section {
      margin-bottom: 24px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  isDarkMode = false;
  currentUser: User | null = null;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize theme state
    this.isDarkMode = this.themeService.getCurrentTheme();
    
    // Subscribe to theme changes
    this.themeService.isDarkMode.subscribe(isDark => {
      console.log('Theme changed:', isDark);
      this.isDarkMode = isDark;
    });

    // Get current user
    this.currentUser = this.authService.currentUserValue;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  onThemeToggle(event: CustomEvent) {
    const isDark = event.detail.checked;
    console.log('Toggling theme:', isDark);
    this.themeService.setTheme(isDark);
  }

  async signOut() {
    try {
      await this.authService.logout();
      localStorage.clear(); // Clear all local storage
      this.router.navigate(['/auth'], { 
        replaceUrl: true,
        skipLocationChange: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
} 