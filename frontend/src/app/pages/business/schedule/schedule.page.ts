import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Schedule</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Weekly Schedule</ion-card-title>
                <ion-card-subtitle>{{ currentWeek }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="schedule-grid">
                  <div *ngFor="let day of weekDays" class="day-column">
                    <div class="day-header">{{ day }}</div>
                    <div class="shifts-container">
                      <div *ngFor="let shift of getShiftsForDay(day)" class="shift-item">
                        <strong>{{ formatTime(shift.start_time) }}</strong>
                        <span>{{ shift.worker?.name || 'Unassigned' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    .schedule-grid {
      display: flex;
      overflow-x: auto;
      min-height: 500px;
    }
    .day-column {
      flex: 1;
      min-width: 150px;
      border-right: 1px solid var(--ion-color-light);
    }
    .day-header {
      padding: 10px;
      text-align: center;
      font-weight: bold;
      background: var(--ion-color-light);
    }
    .shifts-container {
      padding: 10px;
    }
    .shift-item {
      margin: 5px 0;
      padding: 8px;
      background: var(--ion-color-primary-tint);
      border-radius: 4px;
      font-size: 0.9em;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SchedulePage implements OnInit {
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  currentWeek = '';
  shifts: any[] = [];

  constructor() {}

  ngOnInit() {
    this.currentWeek = this.formatWeekRange(new Date());
    // TODO: Implement shift loading logic
    this.shifts = [
      {
        start_time: new Date(),
        end_time: new Date(),
        worker: { name: 'John Doe' }
      }
    ];
  }

  formatWeekRange(date: Date): string {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  getShiftsForDay(day: string): any[] {
    // TODO: Implement proper shift filtering by day
    return this.shifts;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
} 