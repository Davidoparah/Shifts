import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  businessName: string;
  lastUpdate: Date;
  category: string;
}

@Component({
  selector: 'app-support',
  template: `
    <ion-content>
      <div class="support-container">
        <!-- Support Overview -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Support Overview</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="12" size-md="3">
                  <div class="stat">
                    <ion-icon name="help-buoy" color="primary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ openTickets }}</span>
                      <span class="label">Open Tickets</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="3">
                  <div class="stat">
                    <ion-icon name="time" color="warning"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ avgResponseTime }}h</span>
                      <span class="label">Avg. Response Time</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="3">
                  <div class="stat">
                    <ion-icon name="checkmark-circle" color="success"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ resolvedToday }}</span>
                      <span class="label">Resolved Today</span>
                    </div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="3">
                  <div class="stat">
                    <ion-icon name="star" color="tertiary"></ion-icon>
                    <div class="stat-details">
                      <span class="value">{{ satisfactionRate }}%</span>
                      <span class="label">Satisfaction Rate</span>
                    </div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Support Tickets -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Support Tickets</ion-card-title>
            <ion-card-subtitle>
              <ion-searchbar
                [(ngModel)]="searchTerm"
                (ionInput)="filterTickets()"
                placeholder="Search tickets"
                [debounce]="300"
              ></ion-searchbar>
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let ticket of filteredTickets">
                <ion-icon 
                  [name]="getPriorityIcon(ticket.priority)"
                  [color]="getPriorityColor(ticket.priority)"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  <h2>{{ ticket.subject }}</h2>
                  <p>{{ ticket.businessName }} - {{ ticket.category }}</p>
                  <ion-note>Last updated: {{ ticket.lastUpdate | date:'medium' }}</ion-note>
                </ion-label>
                <ion-badge 
                  [color]="getStatusColor(ticket.status)"
                  slot="end"
                >
                  {{ ticket.status | titlecase }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Quick Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Quick Actions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6" size-md="3">
                  <ion-button expand="block" color="primary">
                    <ion-icon name="add" slot="start"></ion-icon>
                    New Ticket
                  </ion-button>
                </ion-col>
                <ion-col size="6" size-md="3">
                  <ion-button expand="block" color="secondary">
                    <ion-icon name="analytics" slot="start"></ion-icon>
                    Reports
                  </ion-button>
                </ion-col>
                <ion-col size="6" size-md="3">
                  <ion-button expand="block" color="tertiary">
                    <ion-icon name="settings" slot="start"></ion-icon>
                    Settings
                  </ion-button>
                </ion-col>
                <ion-col size="6" size-md="3">
                  <ion-button expand="block" color="medium">
                    <ion-icon name="help-circle" slot="start"></ion-icon>
                    Knowledge Base
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .support-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }

    ion-card {
      margin: 16px 0;
      border-radius: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;

      ion-icon {
        font-size: 32px;
      }

      .stat-details {
        display: flex;
        flex-direction: column;

        .value {
          font-size: 24px;
          font-weight: 700;
          color: var(--ion-text-color);
        }

        .label {
          font-size: 14px;
          color: var(--ion-color-medium);
        }
      }
    }

    ion-searchbar {
      padding: 0;
      margin-top: 16px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --border-radius: 8px;
      margin: 8px 0;

      h2 {
        font-weight: 500;
        margin-bottom: 4px;
      }

      p {
        color: var(--ion-color-medium);
      }

      ion-note {
        font-size: 12px;
        margin-top: 4px;
      }

      ion-badge {
        font-size: 14px;
        padding: 6px 12px;
      }
    }

    ion-button {
      margin: 8px 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SupportPage implements OnInit {
  searchTerm = '';
  openTickets = 24;
  avgResponseTime = 2.5;
  resolvedToday = 18;
  satisfactionRate = 95;

  tickets: Ticket[] = [
    {
      id: '1',
      subject: 'Worker App Login Issue',
      status: 'open',
      priority: 'high',
      businessName: 'TechCorp Inc.',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 30),
      category: 'Authentication'
    },
    {
      id: '2',
      subject: 'Billing Integration Error',
      status: 'in-progress',
      priority: 'urgent',
      businessName: 'Global Services Ltd.',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 45),
      category: 'Billing'
    },
    {
      id: '3',
      subject: 'Shift Schedule Not Updating',
      status: 'resolved',
      priority: 'medium',
      businessName: 'StartUp Solutions',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60),
      category: 'Scheduling'
    }
  ];

  filteredTickets: Ticket[] = [];

  constructor() {
    this.filteredTickets = this.tickets;
  }

  ngOnInit() {}

  filterTickets() {
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredTickets = this.tickets.filter(ticket =>
      ticket.subject.toLowerCase().includes(searchTerm) ||
      ticket.businessName.toLowerCase().includes(searchTerm) ||
      ticket.category.toLowerCase().includes(searchTerm)
    );
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'flash';
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'information-circle';
      case 'low':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'success';
      default:
        return 'medium';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'warning';
      case 'in-progress':
        return 'primary';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'medium';
      default:
        return 'medium';
    }
  }
} 