import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';

@Component({
  selector: 'app-view-shift',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/business-owner"></ion-back-button>
        </ion-buttons>
        <ion-title>View Shift</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="editShift()" *ngIf="canEdit">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="shift">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ shift.title }}</ion-card-title>
            <ion-badge [color]="getStatusColor(shift.status)" class="ion-margin-top">
              {{ shift.status }}
            </ion-badge>
          </ion-card-header>

          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon name="time-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Time</h2>
                  <p>{{ shift.start_time | date:'shortTime' }} - {{ shift.end_time | date:'shortTime' }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="calendar-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Date</h2>
                  <p>{{ shift.start_time | date:'mediumDate' }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="location-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Location</h2>
                  <p>{{ shift.location }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="cash-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Rate</h2>
                  <p>{{ shift.rate | currency }}/hr</p>
                </ion-label>
              </ion-item>

              <ion-item *ngIf="shift.dress_code">
                <ion-icon name="shirt-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Dress Code</h2>
                  <p>{{ shift.dress_code }}</p>
                </ion-label>
              </ion-item>

              <ion-item *ngIf="shift.requirements?.length">
                <ion-icon name="list-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Requirements</h2>
                  <p *ngFor="let req of shift.requirements">{{ req }}</p>
                </ion-label>
              </ion-item>

              <ion-item *ngIf="shift.notes">
                <ion-icon name="document-text-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Notes</h2>
                  <p>{{ shift.notes }}</p>
                </ion-label>
              </ion-item>

              <ion-item *ngIf="shift.worker">
                <ion-icon name="person-outline" slot="start"></ion-icon>
                <ion-label>
                  <h2>Worker</h2>
                  <p>{{ shift.worker.name }}</p>
                  <p *ngIf="shift.worker.rating">
                    Rating: {{ shift.worker.rating }}/5
                    <ion-icon name="star" color="warning"></ion-icon>
                  </p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <div class="ion-padding">
          <ion-button expand="block" color="danger" (click)="deleteShift()" *ngIf="canDelete">
            Delete Shift
          </ion-button>
        </div>
      </div>

      <div *ngIf="!shift" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>Loading shift details...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    ion-card-header {
      padding: 16px;
    }

    ion-card-title {
      font-size: 1.5rem;
      font-weight: bold;
    }

    ion-badge {
      padding: 8px 12px;
      border-radius: 4px;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 8px;

      ion-icon {
        font-size: 1.25rem;
      }

      ion-label {
        h2 {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 4px;
        }

        p {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
        }
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ViewShiftPage implements OnInit {
  shift: Shift | null = null;
  canEdit = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftService: ShiftService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShift();
  }

  async loadShift() {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        throw new Error('No shift ID provided');
      }

      console.log('Loading shift with ID:', id);
      const shift = await this.shiftService.getShift(id).toPromise();
      console.log('Received shift data:', shift);
      
      if (!shift) {
        throw new Error('Shift not found');
      }
      
      this.shift = shift;
      
      // Check if the shift can be edited or deleted
      const now = new Date();
      const startTime = new Date(shift.start_time);
      this.canEdit = startTime > now && shift.status === 'available';
      this.canDelete = shift.status !== 'in_progress' && shift.status !== 'completed';
    } catch (error) {
      console.error('Error loading shift:', error);
      const toast = await this.toastCtrl.create({
        message: error instanceof Error ? error.message : 'Failed to load shift details',
        duration: 3000,
        color: 'danger',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
      this.router.navigate(['/business-owner']);
    }
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

  editShift() {
    if (this.shift) {
      this.router.navigate(['/business-owner/edit-shift', this.shift.id]);
    }
  }

  async deleteShift() {
    if (!this.shift) return;

    const toast = await this.toastCtrl.create({
      message: 'Are you sure you want to delete this shift?',
      duration: 3000,
      color: 'warning',
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
              await this.shiftService.deleteShift(this.shift!.id).toPromise();
              const successToast = await this.toastCtrl.create({
                message: 'Shift deleted successfully',
                duration: 2000,
                color: 'success'
              });
              await successToast.present();
              this.router.navigate(['/business-owner']);
            } catch (error) {
              console.error('Error deleting shift:', error);
              const errorToast = await this.toastCtrl.create({
                message: 'Failed to delete shift',
                duration: 3000,
                color: 'danger'
              });
              await errorToast.present();
            }
          }
        }
      ]
    });

    await toast.present();
  }
} 