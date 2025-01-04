import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-applications',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Applications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-group *ngFor="let application of applications">
          <ion-item>
            <ion-avatar slot="start">
              <img [src]="application.worker.avatar || 'assets/default-avatar.png'" alt="Worker avatar">
            </ion-avatar>
            <ion-label>
              <h2>{{ application.worker.name }}</h2>
              <p>Applied for: {{ application.shift.title }}</p>
              <p>Date: {{ formatDate(application.shift.start_time) }}</p>
              <p>Time: {{ formatTime(application.shift.start_time) }} - {{ formatTime(application.shift.end_time) }}</p>
            </ion-label>
            <ion-buttons slot="end">
              <ion-button color="success" (click)="acceptApplication(application)">
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              </ion-button>
              <ion-button color="danger" (click)="rejectApplication(application)">
                <ion-icon name="close-circle-outline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-item-group>

        <ion-item *ngIf="applications.length === 0">
          <ion-label class="ion-text-center">
            <p>No pending applications</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }
    ion-button {
      margin: 0 4px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ApplicationsPage implements OnInit {
  applications: any[] = [];

  constructor() {}

  ngOnInit() {
    // TODO: Implement applications loading logic
    this.applications = [
      {
        worker: {
          name: 'John Doe',
          avatar: null
        },
        shift: {
          title: 'Morning Shift',
          start_time: new Date(),
          end_time: new Date(new Date().getTime() + 4 * 60 * 60 * 1000)
        }
      }
    ];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  acceptApplication(application: any) {
    // TODO: Implement accept logic
    console.log('Accepting application:', application);
  }

  rejectApplication(application: any) {
    // TODO: Implement reject logic
    console.log('Rejecting application:', application);
  }
} 