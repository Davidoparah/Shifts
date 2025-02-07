import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService, Incident } from '../../../../services/incident.service';

@Component({
  selector: 'app-incidents-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker"></ion-back-button>
        </ion-buttons>
        <ion-title>Incidents</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/worker/incidents/report" color="primary">
            <ion-icon name="add-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-segment [(ngModel)]="selectedStatus" (ionChange)="filterIncidents()" class="ion-padding">
        <ion-segment-button value="all">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button value="pending">
          <ion-label>Pending</ion-label>
        </ion-segment-button>
        <ion-segment-button value="resolved">
          <ion-label>Resolved</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Loading Skeleton -->
      <ion-list *ngIf="isLoading">
        <ion-item *ngFor="let i of [1,2,3]">
          <ion-label>
            <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            <p><ion-skeleton-text animated style="width: 40%"></ion-skeleton-text></p>
            <p><ion-skeleton-text animated style="width: 30%"></ion-skeleton-text></p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Error Message -->
      <ion-item *ngIf="error" lines="none" class="ion-text-center">
        <ion-label color="danger">
          <p>{{ error }}</p>
          <ion-button fill="clear" (click)="loadIncidents()">Try Again</ion-button>
        </ion-label>
      </ion-item>

      <!-- Incidents List -->
      <ion-list *ngIf="!isLoading && !error">
        <ion-item *ngFor="let incident of filteredIncidents" [routerLink]="['/worker/incidents', incident.id]">
          <ion-badge slot="start" [color]="getSeverityColor(incident.severity)">
            {{ incident.severity }}
          </ion-badge>
          <ion-label>
            <h2>{{ incident.title }}</h2>
            <p>{{ incident.created_at | date:'medium' }}</p>
            <p>{{ incident.location }}</p>
          </ion-label>
          <ion-badge slot="end" [color]="getStatusColor(incident.status)">
            {{ incident.status }}
          </ion-badge>
          <ion-icon name="chevron-forward" slot="end"></ion-icon>
        </ion-item>

        <ion-item *ngIf="filteredIncidents.length === 0" lines="none">
          <ion-label class="ion-text-center">
            <p>No incidents found</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/worker/incidents/report" color="primary">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-segment {
      --background: var(--ion-color-light);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    ion-badge {
      text-transform: capitalize;
      
      &[slot="start"] {
        min-width: 70px;
        text-align: center;
      }
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      margin-bottom: 8px;

      h2 {
        font-weight: 600;
        margin-bottom: 4px;
      }

      p {
        margin: 2px 0;
        color: var(--ion-color-medium);
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class IncidentsListPage implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  selectedStatus: 'all' | 'pending' | 'resolved' = 'all';
  isLoading = false;
  error: string | null = null;

  constructor(private incidentService: IncidentService) {}

  ngOnInit() {
    this.loadIncidents();
  }

  async loadIncidents() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const incidents = await this.incidentService.getIncidents().toPromise();
      this.incidents = incidents || [];
      this.filterIncidents();
    } catch (error) {
      console.error('Error loading incidents:', error);
      this.error = 'Failed to load incidents. Please try again.';
      this.incidents = [];
    } finally {
      this.isLoading = false;
    }
  }

  async refresh(event: any) {
    this.error = null;
    try {
      await this.loadIncidents();
    } finally {
      event.target.complete();
    }
  }

  filterIncidents() {
    if (this.selectedStatus === 'all') {
      this.filteredIncidents = this.incidents;
    } else {
      this.filteredIncidents = this.incidents.filter(
        incident => incident.status === this.selectedStatus
      );
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'medium';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewing':
        return 'primary';
      case 'resolved':
        return 'success';
      default:
        return 'medium';
    }
  }
} 