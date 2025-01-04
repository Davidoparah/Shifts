import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService, Shift, Location } from '../../../services/shift.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-history',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Shift History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item *ngFor="let shift of completedShifts">
          <ion-label>
            <h2>{{shift.business.name}}</h2>
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
            <ion-badge color="primary">Completed</ion-badge>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="completedShifts.length === 0">
          <ion-label class="ion-text-center">
            <p>No completed shifts</p>
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
      margin-bottom: 8px;
    }

    ion-label p {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 4px 0;
    }

    ion-icon {
      font-size: 16px;
      min-width: 16px;
    }

    ion-badge {
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HistoryPage implements OnInit {
  completedShifts: Shift[] = [];
  currentPage = 1;
  hasMoreData = true;

  constructor(
    private shiftService: ShiftService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  async loadShifts() {
    this.currentPage = 1;
    try {
      const shifts = await firstValueFrom(this.shiftService.getShiftHistory(this.currentPage));
      this.completedShifts = shifts;
    } catch (error) {
      console.error('Error loading shifts:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load shifts',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
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

  async loadMore(event: any) {
    if (!this.hasMoreData) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    try {
      const newShifts = await firstValueFrom(this.shiftService.getShiftHistory(this.currentPage));
      this.completedShifts = [...this.completedShifts, ...newShifts];
      event.target.complete();

      if (newShifts.length === 0) {
        this.hasMoreData = false;
      }
    } catch (error) {
      console.error('Error loading more shifts:', error);
      event.target.complete();
      this.hasMoreData = false;
    }
  }

  async handleRefresh(event: any) {
    this.currentPage = 1;
    this.hasMoreData = true;
    
    try {
      const shifts = await firstValueFrom(this.shiftService.getShiftHistory(this.currentPage));
      this.completedShifts = shifts;
      event.target.complete();
    } catch (error) {
      console.error('Error refreshing shifts:', error);
      event.target.complete();
      
      const toast = await this.toastCtrl.create({
        message: 'Failed to refresh shifts',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
} 