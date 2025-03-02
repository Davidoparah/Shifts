import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-available',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Available Shifts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item-sliding *ngFor="let shift of availableShifts">
          <ion-item>
            <ion-label>
              <h2>{{ shift.title }}</h2>
              <h3>{{ shift.business?.name || 'Unknown Business' }}</h3>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{isLocationObject(shift.location) ? shift.location.formatted_address : shift.location}}
              </p>
              <p>
                <ion-icon name="time-outline"></ion-icon>
                {{formatDateTime(shift.start_time)}} - {{formatDateTime(shift.end_time)}}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{shift.rate | currency}}/hr
              </p>
              <div *ngIf="shift.requirements?.length">
                <p><ion-icon name="list-outline"></ion-icon> Requirements:</p>
                <ion-chip *ngFor="let req of shift.requirements" color="primary" outline>
                  {{req}}
                </ion-chip>
              </div>
              <div *ngIf="shift.notes">
                <p><ion-icon name="information-circle-outline"></ion-icon> Notes:</p>
                <p class="shift-notes">{{shift.notes}}</p>
              </div>
            </ion-label>
            <ion-button slot="end" (click)="applyForShift(shift)" [disabled]="shift.has_applied">
              {{ shift.has_applied ? 'Applied' : 'Apply' }}
            </ion-button>
          </ion-item>
        </ion-item-sliding>

        <ion-item *ngIf="availableShifts.length === 0" class="no-shifts">
          <ion-label class="ion-text-center">
            <h3>No Available Shifts</h3>
            <p>Pull down to refresh and check for new shifts</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content
          loadingSpinner="bubbles"
          loadingText="Loading more shifts...">
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `,
  styles: [`
    ion-label h2 {
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--ion-color-dark);
    }

    ion-label h3 {
      font-size: 0.9em;
      margin-bottom: 8px;
      color: var(--ion-color-medium);
    }

    ion-label p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: var(--ion-color-medium);
    }

    ion-icon {
      font-size: 18px;
      min-width: 18px;
    }

    ion-chip {
      margin: 4px;
    }

    .shift-notes {
      font-style: italic;
      margin-left: 26px;
      white-space: normal;
    }

    .no-shifts {
      margin: 32px 0;
      
      h3 {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--ion-color-medium);
      }
      
      p {
        font-size: 0.9em;
        color: var(--ion-color-medium);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AvailablePage implements OnInit {
  availableShifts: Shift[] = [];
  currentPage = 1;
  perPage = 10;
  hasMoreData = true;

  constructor(
    private shiftService: ShiftService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  loadShifts(event?: any) {
    this.shiftService.getAvailableShifts({
      page: this.currentPage,
      per_page: this.perPage
    }).subscribe({
      next: (response) => {
        if (event) {
          this.availableShifts = [...this.availableShifts, ...response.data];
        } else {
          this.availableShifts = response.data;
        }
        
        this.hasMoreData = this.currentPage < response.meta.total_pages;
        if (event) {
          event.target.complete();
          if (!this.hasMoreData) {
            event.target.disabled = true;
          }
        }
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  async applyForShift(shift: Shift) {
    if (shift.has_applied) {
      const toast = await this.toastCtrl.create({
        message: 'You have already applied for this shift',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Apply for Shift',
      message: `Are you sure you want to apply for this shift at ${shift.business?.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: async () => {
            try {
              // Check if the shift is still available
              if (shift.status !== 'available') {
                throw new Error('This shift is no longer available');
              }

              // Check if the shift hasn't started yet
              if (new Date(shift.start_time) <= new Date()) {
                throw new Error('This shift has already started');
              }

              await firstValueFrom(this.shiftService.applyForShift(shift.id));
              
              // Update the shift's status locally
              shift.has_applied = true;
              
              const toast = await this.toastCtrl.create({
                message: 'Successfully applied for shift',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });
              await toast.present();
            } catch (error: any) {
              console.error('Error applying for shift:', error);
              const toast = await this.toastCtrl.create({
                message: error.message || 'Failed to apply for shift. Please try again.',
                duration: 3000,
                color: 'danger',
                position: 'bottom'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  handleRefresh(event: any) {
    this.currentPage = 1;
    this.hasMoreData = true;
    this.loadShifts(event);
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    if (this.hasMoreData) {
      this.currentPage++;
      this.loadShifts(event);
    } else {
      event.target.complete();
    }
  }

  isLocationObject(location: any): location is { formatted_address: string } {
    return typeof location === 'object' && location !== null && 'formatted_address' in location;
  }

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString();
  }
}