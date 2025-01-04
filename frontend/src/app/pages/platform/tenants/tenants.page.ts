import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  workers: number;
  shifts: number;
  joinedDate: Date;
}

@Component({
  selector: 'app-tenants',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-searchbar
          [(ngModel)]="searchTerm"
          (ionInput)="filterTenants()"
          placeholder="Search tenants"
          [debounce]="300"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-group *ngFor="let tenant of filteredTenants">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="'https://ui-avatars.com/api/?name=' + tenant.name" alt="Tenant avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ tenant.name }}</h2>
              <p>{{ tenant.email }}</p>
              <p>{{ tenant.phone }}</p>
            </ion-label>
            <ion-badge [color]="getStatusColor(tenant.status)" slot="end">
              {{ tenant.status }}
            </ion-badge>
          </ion-item>
          
          <ion-item lines="none">
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="stat">
                    <ion-icon name="people" color="primary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ tenant.workers }}</span>
                      <span class="label">Workers</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="stat">
                    <ion-icon name="calendar" color="tertiary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ tenant.shifts }}</span>
                      <span class="label">Shifts</span>
                    </div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>

          <ion-item lines="none">
            <ion-note slot="end">
              Joined {{ tenant.joinedDate | date:'mediumDate' }}
            </ion-note>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 8px;
      --padding-bottom: 8px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 12px;

      ion-icon {
        font-size: 24px;
      }

      .stat-details {
        display: flex;
        flex-direction: column;

        .value {
          font-size: 16px;
          font-weight: 600;
          color: var(--ion-text-color);
        }

        .label {
          font-size: 12px;
          color: var(--ion-color-medium);
        }
      }
    }

    ion-note {
      font-size: 12px;
    }

    ion-badge {
      text-transform: capitalize;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TenantsPage implements OnInit {
  searchTerm = '';
  tenants: Tenant[] = [
    {
      id: '1',
      name: 'TechCorp Inc.',
      email: 'admin@techcorp.com',
      phone: '(555) 123-4567',
      status: 'active',
      workers: 45,
      shifts: 128,
      joinedDate: new Date('2023-01-15')
    },
    {
      id: '2',
      name: 'Global Services Ltd.',
      email: 'contact@globalservices.com',
      phone: '(555) 987-6543',
      status: 'active',
      workers: 32,
      shifts: 96,
      joinedDate: new Date('2023-02-20')
    },
    {
      id: '3',
      name: 'StartUp Solutions',
      email: 'hello@startupsolutions.com',
      phone: '(555) 456-7890',
      status: 'pending',
      workers: 8,
      shifts: 24,
      joinedDate: new Date('2023-03-10')
    }
  ];
  filteredTenants: Tenant[] = [];

  constructor() {
    this.filteredTenants = this.tenants;
  }

  ngOnInit() {}

  filterTenants() {
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredTenants = this.tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm) ||
      tenant.email.toLowerCase().includes(searchTerm) ||
      tenant.phone.includes(searchTerm)
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'medium';
      case 'pending':
        return 'warning';
      default:
        return 'medium';
    }
  }
} 