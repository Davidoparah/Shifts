import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { Shift, Location } from '../../../models/shift.model';
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
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="success" (click)="applyForShift(shift)">
              <ion-icon slot="icon-only" name="checkmark"></ion-icon>
              Apply
            </ion-item-option>
          </ion-item-options>
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

    ion-item-option {
      --padding-start: 16px;
      --padding-end: 16px;
      
      ion-icon {
        font-size: 24px;
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AvailablePage implements OnInit {
  availableShifts: Shift[] = [];
  currentPage = 1;
  hasMoreData = true;
  isLoading = false;

  constructor(
    private shiftService: ShiftService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  async loadShifts(event?: any) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.currentPage = 1;
    
    try {
      console.log('Loading available shifts...');
      const shifts = await firstValueFrom(this.shiftService.getAvailableShifts());
      console.log('Loaded shifts:', shifts);
      this.availableShifts = shifts;
      
      if (event) {
        event.target.complete();
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load shifts. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  isLocationObject(location: string | Location): location is Location {
    return typeof location !== 'string' && location !== null && 'formatted_address' in location;
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  async handleRefresh(event: any) {
    await this.loadShifts(event);
  }

  async loadMore(event: InfiniteScrollCustomEvent) {
    if (!this.hasMoreData) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    try {
      const newShifts = await firstValueFrom(this.shiftService.getAvailableShifts());
      if (newShifts.length > 0) {
        this.availableShifts = [...this.availableShifts, ...newShifts];
      } else {
        this.hasMoreData = false;
      }
    } catch (error) {
      console.error('Error loading more shifts:', error);
      this.hasMoreData = false;
    } finally {
      event.target.complete();
    }
  }

  async applyForShift(shift: Shift) {
    const alert = await this.alertCtrl.create({
      header: 'Apply for Shift',
      message: 'Are you sure you want to apply for this shift?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: async () => {
            try {
              await firstValueFrom(this.shiftService.applyForShift(shift.id));
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
                duration: 3000,
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
}