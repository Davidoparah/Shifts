import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon>
            Logout
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Welcome!</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Email: {{ user?.email }}</p>
          <p>Role: {{ user?.role }}</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      max-width: 600px;
      margin: 20px auto;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DashboardPage implements OnInit {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 