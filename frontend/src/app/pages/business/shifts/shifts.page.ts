import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShiftService } from '../../../services/shift.service';
import { Shift } from '../../../models/shift.model';
import { ShiftsListComponent } from './shifts-list.component';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shifts',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Shifts</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="create">
            <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <app-shifts-list
        [groupedShifts]="groupedShifts"
        (onEdit)="editShift($event)"
        (onDelete)="confirmDelete($event)">
      </app-shifts-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="create">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-top: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ShiftsListComponent]
})
export class ShiftsPage implements OnInit {
  groupedShifts: { [key: string]: Shift[] } = {};
  private isLoading = false;

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  async handleRefresh(event: any) {
    try {
      await this.loadShifts();
    } finally {
      event.target.complete();
    }
  }

  async loadShifts() {
    if (this.isLoading) return;

    try {
      this.isLoading = true;

      // Validate auth status first
      if (!this.authService.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const shifts = await firstValueFrom(this.shiftService.getShifts());
      this.groupShifts(shifts);
    } catch (error: any) {
      console.error('Error loading shifts:', error);
      
      let message = 'Failed to load shifts';
      if (error.message === 'Authentication required') {
        message = 'Please log in to view shifts';
        this.authService.logout();
      }

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  private groupShifts(shifts: Shift[]) {
    // Sort shifts by start time
    shifts.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    // Group shifts by date
    this.groupedShifts = shifts.reduce((groups: { [key: string]: Shift[] }, shift) => {
      const date = new Date(shift.start_time).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(shift);
      return groups;
    }, {});
  }

  async editShift(shift: Shift) {
    // Navigate to edit page
    this.router.navigate(['/business/shifts/edit', shift.id]);
  }

  async confirmDelete(shift: Shift) {
    const alert = await this.alertCtrl.create({
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
              await firstValueFrom(this.shiftService.deleteShift(shift.id));
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