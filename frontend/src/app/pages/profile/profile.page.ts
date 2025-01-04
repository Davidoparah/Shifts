import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-header ion-text-center">
        <ion-avatar style="margin: 0 auto; width: 120px; height: 120px;">
          <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </ion-avatar>
        <h1 class="ion-padding-top">{{ userName }}</h1>
        <p>{{ userEmail }}</p>
      </div>

      <ion-list class="ion-margin-top">
        <ion-item button detail>
          <ion-icon name="person-outline" slot="start"></ion-icon>
          <ion-label>Edit Profile</ion-label>
        </ion-item>

        <ion-item button detail>
          <ion-icon name="notifications-outline" slot="start"></ion-icon>
          <ion-label>Notifications</ion-label>
        </ion-item>

        <ion-item button detail>
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          <ion-label>Settings</ion-label>
        </ion-item>

        <ion-item button detail>
          <ion-icon name="help-circle-outline" slot="start"></ion-icon>
          <ion-label>Help & Support</ion-label>
        </ion-item>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" color="danger" (click)="signOut()">
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Sign Out
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      padding: 20px;
    }
    .profile-header h1 {
      margin: 10px 0 5px;
      font-size: 24px;
      font-weight: 600;
    }
    .profile-header p {
      margin: 0;
      color: var(--ion-color-medium);
    }
    ion-item {
      --padding-start: 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      --background: var(--ion-color-light);
    }
    ion-icon {
      font-size: 24px;
    }
  `]
})
export class ProfilePage implements OnInit {
  userName: string = '';
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
    }
  }

  async signOut() {
    try {
      this.authService.logout();
      await this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
} 