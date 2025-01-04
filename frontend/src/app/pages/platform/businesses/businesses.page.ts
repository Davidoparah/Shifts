import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface Business {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-businesses',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Businesses</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openAddBusinessModal()">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Add Business
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Add Business Modal -->
      <ion-modal [isOpen]="isModalOpen">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Add New Business</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="cancelModal()">Cancel</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <form (ngSubmit)="addBusiness()" #businessForm="ngForm">
              <ion-item>
                <ion-label position="stacked">Business Name*</ion-label>
                <ion-input [(ngModel)]="newBusiness.name" name="name" required #name="ngModel"></ion-input>
                <ion-note color="danger" *ngIf="name.invalid && (name.dirty || name.touched)">
                  Business name is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Email*</ion-label>
                <ion-input 
                  type="email" 
                  [(ngModel)]="newBusiness.email" 
                  name="email" 
                  required 
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  #email="ngModel">
                </ion-input>
                <ion-note color="danger" *ngIf="email.invalid && (email.dirty || email.touched)">
                  Please enter a valid email address
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Phone</ion-label>
                <ion-input type="tel" [(ngModel)]="newBusiness.phone" name="phone"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Address</ion-label>
                <ion-textarea [(ngModel)]="newBusiness.address" name="address"></ion-textarea>
              </ion-item>

              <ion-button 
                type="submit" 
                expand="block" 
                class="ion-margin-top"
                [disabled]="businessForm.invalid">
                Create Business
              </ion-button>
            </form>
          </ion-content>
        </ng-template>
      </ion-modal>

      <!-- Businesses List -->
      <ion-list>
        <ion-item-sliding *ngFor="let business of businesses">
          <ion-item>
            <ion-label>
              <h2>{{ business.name }}</h2>
              <p>{{ business.email }}</p>
              <p>{{ business.phone }}</p>
            </ion-label>
            <ion-badge slot="end" [color]="business.status === 'active' ? 'success' : 'medium'">
              {{ business.status }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewDetails(business)">
              <ion-icon slot="icon-only" name="eye-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option 
              [color]="business.status === 'active' ? 'warning' : 'success'"
              (click)="toggleStatus(business)">
              <ion-icon slot="icon-only" [name]="business.status === 'active' ? 'pause-outline' : 'play-outline'"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDelete(business)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item *ngIf="businesses.length === 0">
          <ion-label class="ion-text-center">
            <p>No businesses found</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Loading Spinner -->
      <ion-spinner *ngIf="isLoading" class="loading-spinner"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    ion-badge {
      margin-right: 16px;
    }
    ion-note {
      font-size: 0.8em;
      margin-top: 4px;
    }
    ion-item-option {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    .loading-spinner {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BusinessesPage implements OnInit {
  businesses: Business[] = [];
  isModalOpen = false;
  isLoading = false;
  newBusiness: Business = {
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadBusinesses() {
    this.isLoading = true;
    this.http.get<Business[]>(`${environment.apiUrl}/api/platform/businesses`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        this.showToast('Error loading businesses', 'danger');
        this.isLoading = false;
      }
    });
  }

  async confirmDelete(business: Business) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${business.name}? This action cannot be undone and will delete all associated data including users, shifts, and locations.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteBusiness(business);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteBusiness(business: Business) {
    if (!business._id) return;

    this.isLoading = true;
    this.http.delete(`${environment.apiUrl}/api/platform/businesses/${business._id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.businesses = this.businesses.filter(b => b._id !== business._id);
        this.showToast('Business deleted successfully', 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting business:', error);
        this.showToast(error.error?.error || 'Error deleting business', 'danger');
        this.isLoading = false;
      }
    });
  }

  toggleStatus(business: Business) {
    if (!business._id) return;

    const newStatus = business.status === 'active' ? 'inactive' : 'active';
    
    this.http.patch(`${environment.apiUrl}/api/platform/businesses/${business._id}/status`, 
      { status: newStatus },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        business.status = newStatus;
        this.showToast(`Business ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      },
      error: (error) => {
        console.error('Error updating business status:', error);
        this.showToast('Error updating business status', 'danger');
      }
    });
  }

  viewDetails(business: Business) {
    // TODO: Implement business details view
    console.log('View business details:', business);
  }

  openAddBusinessModal() {
    this.isModalOpen = true;
  }

  cancelModal() {
    this.isModalOpen = false;
    this.resetNewBusiness();
  }

  resetNewBusiness() {
    this.newBusiness = {
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    };
  }

  addBusiness() {
    const payload = { business: this.newBusiness };
    
    this.isLoading = true;
    this.http.post<Business>(
      `${environment.apiUrl}/api/platform/businesses`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (business) => {
        this.businesses.push(business);
        this.isModalOpen = false;
        this.resetNewBusiness();
        this.showToast('Business created successfully', 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating business:', error);
        this.showToast(error.error?.errors?.join(', ') || 'Error creating business', 'danger');
        this.isLoading = false;
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
} 