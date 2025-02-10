import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-shift-details',
  styleUrls: ['./shifts.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner/shifts"></ion-back-button>
        </ion-buttons>
        <ion-title>Shift Details</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="editShift()" *ngIf="canEdit">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="card-container" *ngIf="shift">
        <div class="section-header">
          <ion-icon name="briefcase-outline"></ion-icon>
          <h2>{{ shift?.title }}</h2>
        </div>
        <ion-badge [color]="getStatusColor(shift?.status || '')">
          {{ shift?.status }}
        </ion-badge>

        <div class="section-header">
          <ion-icon name="time-outline"></ion-icon>
          <h2>Schedule</h2>
        </div>

        <ion-item>
          <ion-label>
            <h2>Time</h2>
            <p>{{ shift?.start_time | date:'shortTime' }} - {{ shift?.end_time | date:'shortTime' }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Date</h2>
            <p>{{ shift?.start_time | date:'mediumDate' }}</p>
          </ion-label>
        </ion-item>

        <div class="section-header">
          <ion-icon name="location-outline"></ion-icon>
          <h2>Location & Payment</h2>
        </div>

        <ion-item>
          <ion-label>
            <h2>Location</h2>
            <p>{{ shift?.location_name || 'No location name set' }}</p>
            <p>{{ shift?.location_address || 'No location address set' }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Rate</h2>
            <p>{{ shift?.hourly_rate | currency }}/hr</p>
          </ion-label>
        </ion-item>

        <div class="section-header">
          <ion-icon name="information-circle-outline"></ion-icon>
          <h2>Additional Details</h2>
        </div>

        <ion-item *ngIf="shift?.dress_code">
          <ion-label>
            <h2>Dress Code</h2>
            <p>{{ shift?.dress_code }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift?.requirements?.length">
          <ion-label>
            <h2>Requirements</h2>
            <p>{{ shift?.requirements?.join(', ') }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="shift?.notes">
          <ion-label>
            <h2>Notes</h2>
            <p>{{ shift?.notes }}</p>
          </ion-label>
        </ion-item>

        <div class="section-header" *ngIf="shift?.worker">
          <ion-icon name="person-outline"></ion-icon>
          <h2>Worker Details</h2>
        </div>

        <ion-item *ngIf="shift?.worker">
          <ion-label>
            <h2>{{ shift?.worker?.name }}</h2>
            <p *ngIf="shift?.worker?.rating">
              Rating: {{ shift?.worker?.rating }}/5
              <ion-icon name="star" color="warning"></ion-icon>
            </p>
          </ion-label>
        </ion-item>
      </div>

      <div class="action-button" *ngIf="shift && canDelete">
        <ion-button expand="block" color="danger" (click)="deleteShift()">
          <ion-icon name="trash-outline" slot="start"></ion-icon>
          Delete Shift
        </ion-button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <ion-spinner></ion-spinner>
        <p>Loading shift details...</p>
      </div>

      <div class="error-container" *ngIf="error">
        <p>{{ error }}</p>
      </div>
    </ion-content>
  `
})
export class ShiftDetailsPage implements OnInit {
  shift: Shift | null = null;
  loading = true;
  error: string | null = null;
  canEdit = false;
  canDelete = false;

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
    try {
      this.loading = true;
      this.error = null;
      const id = this.route.snapshot.paramMap.get('id');
      
      if (!id) {
        throw new Error('Shift ID not found');
      }

      const shift = await this.shiftService.getShift(id).toPromise();
      if (!shift) {
        throw new Error('Shift not found');
      }

      this.shift = shift;
      
      // Check if shift can be edited/deleted
      const now = new Date();
      const shiftStart = new Date(shift.start_time);
      this.canEdit = shiftStart > now;
      this.canDelete = shiftStart > now;
    } catch (error: any) {
      console.error('Error loading shift:', error);
      this.error = error.message || 'Failed to load shift details';
      const toast = await this.toastCtrl.create({
        message: error.message || 'Failed to load shift details',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      this.router.navigate(['/business-owner/shifts']);
    } finally {
      this.loading = false;
    }
  }

  async editShift() {
    if (!this.shift) return;
    this.router.navigate(['/business-owner/shifts/edit', this.shift.id]);
  }

  async deleteShift() {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this shift?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              if (this.shift?.id) {
                await this.shiftService.deleteShift(this.shift.id).toPromise();
                const toast = await this.toastCtrl.create({
                  message: 'Shift deleted successfully',
                  duration: 2000,
                  color: 'success'
                });
                toast.present();
                this.router.navigate(['/business-owner/shifts']);
              }
            } catch (error) {
              console.error('Error deleting shift:', error);
              const toast = await this.toastCtrl.create({
                message: 'Failed to delete shift',
                duration: 3000,
                color: 'danger'
              });
              toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'primary';
      case 'assigned': return 'warning';
      case 'in_progress': return 'tertiary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }
} 