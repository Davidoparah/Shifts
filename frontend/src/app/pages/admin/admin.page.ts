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
      const loading = await this.loadingCtrl.create({
        message: 'Logging out...'
      });
      await loading.present();

      await this.authService.logout().toPromise();

      const toast = await this.toastCtrl.create({
        message: 'Logged out successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error during logout:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to logout',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loadingCtrl.dismiss();
    }
  }

  dismissError() {
    this.errorMessage = '';
  }
} 