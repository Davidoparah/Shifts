import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WorkerService, WorkerProfile, Shift } from '../../services/worker.service';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.page.html',
  styleUrls: ['./worker.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WorkerPage implements OnInit {
  selectedSegment = 'available';
  isLoading = true;
  profile: WorkerProfile | null = null;
  availableShifts: Shift[] = [];
  upcomingShifts: Shift[] = [];
  completedShifts: Shift[] = [];

  constructor(
    private authService: AuthService,
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.loadProfile();
      await this.loadShifts();
    } catch (error) {
      console.error('Error loading data:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load data',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async loadProfile() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error;
    }
  }

  async loadShifts() {
    try {
      const [available, upcoming, completed] = await Promise.all([
        this.workerService.getAvailableShifts().toPromise(),
        this.workerService.getUpcomingShifts().toPromise(),
        this.workerService.getCompletedShifts().toPromise()
      ]);

      if (available) {
        this.availableShifts = available;
      }
      if (upcoming) {
        this.upcomingShifts = upcoming;
      }
      if (completed) {
        this.completedShifts = completed;
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
      throw error;
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async applyForShift(shift: Shift) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Applying for shift...'
      });
      await loading.present();

      await this.workerService.applyForShift(parseInt(shift.id)).toPromise();
      await this.loadShifts();

      const toast = await this.toastCtrl.create({
        message: 'Successfully applied for shift',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error applying for shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to apply for shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loadingCtrl.dismiss();
    }
  }

  async cancelShift(shift: Shift) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Canceling shift...'
      });
      await loading.present();

      await this.workerService.cancelShift(parseInt(shift.id)).toPromise();
      await this.loadShifts();

      const toast = await this.toastCtrl.create({
        message: 'Successfully canceled shift',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error canceling shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to cancel shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loadingCtrl.dismiss();
    }
  }

  async startShift(shift: Shift) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Starting shift...'
      });
      await loading.present();

      await this.workerService.startShift(parseInt(shift.id)).toPromise();
      await this.loadShifts();

      const toast = await this.toastCtrl.create({
        message: 'Successfully started shift',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error starting shift:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to start shift',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loadingCtrl.dismiss();
    }
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
      
      this.router.navigate(['/auth/login']);
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
} 