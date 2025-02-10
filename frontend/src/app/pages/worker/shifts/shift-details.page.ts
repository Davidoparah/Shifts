import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-shift-details',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker/shifts"></ion-back-button>
        </ion-buttons>
        <ion-title>Shift Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-spinner *ngIf="loading" class="ion-margin ion-text-center"></ion-spinner>

      <ion-list *ngIf="!loading && shift">
        <ion-item>
          <ion-label>
            <h1>{{ shift.title }}</h1>
            <ion-badge [color]="getStatusColor(shift.status)">{{ shift.status }}</ion-badge>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Business</h2>
            <p>{{ shift.business_name }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Location</h2>
            <p>
              <ion-icon name="location-outline"></ion-icon>
              {{ shift.location_name ? shift.location_name + ' - ' : '' }}{{ shift.location_address || 'No location set' }}
            </p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Schedule</h2>
            <p>
              <ion-icon name="calendar-outline"></ion-icon>
              Start: {{ shift.start_time | date:'medium' }}
            </p>
            <p>
              <ion-icon name="calendar-outline"></ion-icon>
              End: {{ shift.end_time | date:'medium' }}
            </p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Payment</h2>
            <p>
              <ion-icon name="cash-outline"></ion-icon>
              {{ shift.hourly_rate | currency }}/hr
            </p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.description">
          <ion-label>
            <h2>Description</h2>
            <p>{{ shift.description }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.requirements && shift.requirements.length > 0">
          <ion-label>
            <h2>Requirements</h2>
            <p *ngFor="let req of shift.requirements">• {{ req }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.dress_code">
          <ion-label>
            <h2>Dress Code</h2>
            <p>{{ shift.dress_code }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.check_in_time">
          <ion-label>
            <h2>Check-in Time</h2>
            <p>{{ shift.check_in_time | date:'medium' }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.check_out_time">
          <ion-label>
            <h2>Check-out Time</h2>
            <p>{{ shift.check_out_time | date:'medium' }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.actual_hours_worked">
          <ion-label>
            <h2>Hours Worked</h2>
            <p>{{ shift.actual_hours_worked }} hours</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift.total_earnings">
          <ion-label>
            <h2>Total Earnings</h2>
            <p>{{ shift.total_earnings | currency }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div *ngIf="!loading && shift" class="ion-padding">
        <ion-button *ngIf="canStartShift(shift)" expand="block" color="primary" (click)="startShift()">
          Start Shift
        </ion-button>
        <ion-button *ngIf="canCompleteShift(shift)" expand="block" color="success" (click)="completeShift()">
          Complete Shift
        </ion-button>
      </div>

      <ion-text color="danger" *ngIf="error">
        <p class="ion-text-center">{{ error }}</p>
      </ion-text>
    </ion-content>
  `,
  styles: [`
    ion-spinner {
      display: block;
      margin: 20px auto;
    }
    ion-badge {
      margin-left: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShiftDetailsPage implements OnInit {
  shift: Shift | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftService: ShiftService,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadShift();
  }

  private async loadShift() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Shift ID not found';
      this.loading = false;
      return;
    }

    this.shiftService.getShift(id).subscribe({
      next: (shift) => {
        this.shift = shift;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shift:', error);
        this.error = 'Error loading shift details';
        this.loading = false;
      }
    });
  }

  canStartShift(shift: Shift): boolean {
    if (!shift) return false;
    // Only check if the status is assigned
    return shift.status === 'assigned';
  }

  canCompleteShift(shift: Shift): boolean {
    return shift.status === 'in_progress';
  }

  async startShift() {
    if (!this.shift) return;

    const now = new Date();
    const startTime = new Date(this.shift.start_time);
    const endTime = new Date(this.shift.end_time);
    const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60000);

    // Check timing when the button is clicked
    if (now < fifteenMinutesBefore) {
      const formattedTime = fifteenMinutesBefore.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
      const formattedDate = fifteenMinutesBefore.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const toast = await this.toastCtrl.create({
        message: `You can start this shift from ${formattedTime} on ${formattedDate}`,
        duration: 5000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (now > endTime) {
      const toast = await this.toastCtrl.create({
        message: 'This shift has already ended',
        duration: 5000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Start Shift',
      message: 'Are you sure you want to start this shift?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Start',
          handler: () => {
            this.shiftService.startShift(this.shift!.id).subscribe({
              next: (updatedShift) => {
                if (updatedShift) {
                  this.shift = updatedShift;
                  this.presentToast('Shift started successfully', 'success');
                }
              },
              error: (error) => {
                console.error('Error starting shift:', error);
                let errorMessage = 'Error starting shift';
                
                if (error.error?.message) {
                  errorMessage = error.error.message;
                } else if (error.status === 422) {
                  errorMessage = 'Cannot start shift at this time. Please check shift timing and status.';
                }
                
                this.presentToast(errorMessage, 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async completeShift() {
    if (!this.shift) return;

    const alert = await this.alertController.create({
      header: 'Complete Shift',
      message: 'Are you sure you want to complete this shift?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Complete',
          handler: () => {
            this.shiftService.completeShift(this.shift!.id).subscribe({
              next: (updatedShift) => {
                if (updatedShift) {
                  this.shift = updatedShift;
                  this.presentToast('Shift completed successfully', 'success');
                }
              },
              error: (error) => {
                console.error('Error completing shift:', error);
                this.presentToast('Error completing shift', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'assigned': return 'primary';
      case 'in_progress': return 'tertiary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }
} 