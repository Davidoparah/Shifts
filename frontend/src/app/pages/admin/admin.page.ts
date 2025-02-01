import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class AdminPage implements OnInit {
  selectedSegment = 'businesses';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async logout() {
    try {
      this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  dismissError() {
    this.errorMessage = '';
  }
} 