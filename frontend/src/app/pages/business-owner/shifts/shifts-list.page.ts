import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-shifts-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>All Shifts</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/business-owner/shifts/create">
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item-sliding *ngFor="let shift of shifts">
          <ion-item [routerLink]="['/business-owner/shifts', shift.id]">
            <ion-label>
              <h2>{{ shift.title }}</h2>
              <h3>{{ shift.start_time | date:'medium' }}</h3>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ shift.location_name ? shift.location_name + ' - ' : '' }}{{ shift.location_address || 'No location set' }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ shift.hourly_rate | currency }}/hr
              </p>
            </ion-label>
            <ion-badge slot="end" [color]="getStatusColor(shift.status)">
              {{ shift.status }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="editShift(shift.id)">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="deleteShift(shift.id)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="shifts.length === 0">
          <ion-label class="ion-text-center">
            <p>No shifts found</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content
          loadingSpinner="bubbles"
          loadingText="Loading more shifts...">
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/business-owner/shifts/create">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-item-sliding {
      margin-bottom: 1px;
    }
    ion-badge {
      margin-left: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ShiftsListPage implements OnInit {
  shifts: Shift[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  error: string | null = null;

  constructor(
    private shiftService: ShiftService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  async handleRefresh(event: any) {
    try {
      this.currentPage = 1;
      this.shifts = [];
      this.error = null;
      this.isLoading = true;
      
      const response = await this.shiftService.getShifts({ 
        page: this.currentPage, 
        per_page: 10 
      }).toPromise();
      
      if (response) {
        this.shifts = response.data;
        this.totalPages = response.meta.total_pages;
      }
    } catch (error: any) {
      console.error('Error refreshing shifts:', error);
      const toast = await this.toastController.create({
        message: error.error?.error || error.message || 'Failed to refresh shifts',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isLoading = false;
      event.target.complete();
    }
  }

  loadShifts() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.error = null;

    this.shiftService.getShifts({ page: this.currentPage, per_page: 10 }).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.shifts = response.data;
        } else {
          this.shifts = [...this.shifts, ...response.data];
        }
        this.totalPages = response.meta.total_pages;
        this.isLoading = false;
      },
      error: async (error) => {
        console.error('Error loading shifts:', error);
        const errorMessage = error.error?.error || error.message || 'Failed to load shifts';
        this.error = errorMessage;
        this.isLoading = false;
        
        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  loadMore(event: any) {
    if (this.currentPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.currentPage++;
    this.loadShifts();
    event.target.complete();
  }

  editShift(id: string) {
    // Navigation will be handled by router link
  }

  async deleteShift(id: string) {
    try {
      await this.shiftService.deleteShift(id).toPromise();
      this.shifts = this.shifts.filter(s => s.id !== id);
    } catch (error) {
      console.error('Error deleting shift:', error);
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
} 