import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ShiftService, Shift } from '../../services/shift.service';
import { WorkerService, Worker } from '../../services/worker.service';

@Component({
  selector: 'app-business-owner',
  templateUrl: './business-owner.page.html',
  styleUrls: ['./business-owner.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class BusinessOwnerPage implements OnInit {
  selectedSegment = 'shifts';
  isLoading = false;
  errorMessage = '';

  // Data properties with proper typing
  shifts: Shift[] = [];
  workers: Worker[] = [];
  completedShifts: Shift[] = [];

  constructor(
    private authService: AuthService,
    private shiftService: ShiftService,
    private workerService: WorkerService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadShifts(),
        this.loadWorkers(),
        this.loadCompletedShifts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.errorMessage = 'Failed to load data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadShifts() {
    try {
      const shifts = await this.shiftService.getBusinessShifts().toPromise();
      if (shifts) {
        this.shifts = shifts;
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
      throw error;
    }
  }

  async loadWorkers() {
    try {
      const workers = await this.workerService.getAvailableWorkers().toPromise();
      if (workers) {
        this.workers = workers;
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      throw error;
    }
  }

  async loadCompletedShifts() {
    try {
      const completedShifts = await this.shiftService.getCompletedShifts().toPromise();
      if (completedShifts) {
        this.completedShifts = completedShifts;
      }
    } catch (error) {
      console.error('Error loading completed shifts:', error);
      throw error;
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async createShift() {
    this.router.navigate(['/business-owner/create-shift']);
  }

  async editShift(shift: any) {
    this.router.navigate(['/business-owner/edit-shift', shift.id]);
  }

  async deleteShift(shift: any) {
    const alert = await this.toastCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this shift?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.shiftService.deleteShift(shift.id).toPromise();
              await this.loadShifts();
              const toast = await this.toastCtrl.create({
                message: 'Shift deleted successfully',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('Error deleting shift:', error);
              const toast = await this.toastCtrl.create({
                message: 'Failed to delete shift',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
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

  dismissError() {
    this.errorMessage = '';
  }
} 