import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../services/shift.service';

interface Shift {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-content>
      <div class="page-container">
        <!-- Calendar Header -->
        <section class="calendar-header">
          <ion-card>
            <ion-card-content>
              <div class="calendar-nav">
                <ion-button fill="clear" (click)="previousMonth()">
                  <ion-icon name="chevron-back"></ion-icon>
                </ion-button>
                <h2>{{ currentMonth }} {{ currentYear }}</h2>
                <ion-button fill="clear" (click)="nextMonth()">
                  <ion-icon name="chevron-forward"></ion-icon>
                </ion-button>
              </div>
              <div class="calendar-weekdays">
                <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
              </div>
              <div class="calendar-days">
                <div 
                  class="day" 
                  *ngFor="let day of calendarDays" 
                  [class.today]="isToday(day.date)"
                  [class.has-shift]="day.hasShift"
                  [class.other-month]="day.otherMonth"
                  (click)="selectDate(day.date)"
                >
                  <span>{{ day.date | date:'d' }}</span>
                  <div class="shift-indicator" *ngIf="day.hasShift"></div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </section>

        <!-- Selected Date Shifts -->
        <section class="shifts-section" *ngIf="selectedDateShifts.length > 0">
          <h3>Shifts for {{ selectedDate | date:'mediumDate' }}</h3>
          <ion-list>
            <ion-item *ngFor="let shift of selectedDateShifts" [class]="shift.status">
              <ion-icon 
                slot="start" 
                [name]="getShiftIcon(shift.status)"
                [color]="getShiftColor(shift.status)"
              ></ion-icon>
              <ion-label>
                <h2>{{ shift.startTime | date:'shortTime' }} - {{ shift.endTime | date:'shortTime' }}</h2>
                <p>{{ shift.location }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="getShiftColor(shift.status)">
                {{ shift.status | titlecase }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </section>

        <!-- No Shifts Message -->
        <section class="no-shifts" *ngIf="selectedDate && selectedDateShifts.length === 0">
          <ion-card>
            <ion-card-content>
              <ion-icon name="calendar-outline"></ion-icon>
              <h3>No Shifts Scheduled</h3>
              <p>There are no shifts scheduled for {{ selectedDate | date:'mediumDate' }}</p>
            </ion-card-content>
          </ion-card>
        </section>

        <!-- FAB Button -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button (click)="addNewShift()">
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .calendar-header {
      margin-bottom: 24px;

      ion-card {
        margin: 0;
      }
    }

    .calendar-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
      }

      ion-button {
        --padding-start: 8px;
        --padding-end: 8px;
      }
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 8px;

      .weekday {
        text-align: center;
        font-weight: 500;
        color: var(--ion-color-medium);
        font-size: 0.9rem;
        padding: 8px;
      }
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;

      .day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        position: relative;
        transition: all 0.2s ease;

        span {
          font-size: 0.9rem;
          font-weight: 500;
        }

        &.today {
          background: var(--ion-color-primary);
          color: white;
        }

        &.has-shift {
          font-weight: 600;

          .shift-indicator {
            width: 4px;
            height: 4px;
            background: var(--ion-color-primary);
            border-radius: 50%;
            position: absolute;
            bottom: 4px;
          }
        }

        &.other-month {
          opacity: 0.5;
        }

        &:hover {
          background: var(--ion-color-light-shade);
        }
      }
    }

    .shifts-section {
      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 16px;
        color: var(--ion-color-dark);
      }

      ion-item {
        --padding-start: 16px;
        --padding-end: 16px;
        margin-bottom: 8px;
        border-radius: var(--app-border-radius);

        &.completed {
          --background: var(--ion-color-success-tint);
        }

        &.upcoming {
          --background: var(--ion-color-primary-tint);
        }

        &.cancelled {
          --background: var(--ion-color-medium-tint);
        }

        h2 {
          font-weight: 600;
          font-size: 1rem;
        }

        p {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
        }
      }
    }

    .no-shifts {
      ion-card {
        margin: 0;
        text-align: center;
        padding: 32px;

        ion-icon {
          font-size: 48px;
          color: var(--ion-color-medium);
        }

        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 16px 0 8px;
        }

        p {
          color: var(--ion-color-medium);
          margin: 0;
        }
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .calendar-days .day {
        font-size: 0.8rem;
      }
    }

    /* Dark mode styles */
    :host-context(.dark) {
      .calendar-weekdays .weekday {
        color: var(--ion-color-light);
      }

      .day {
        color: var(--ion-color-light);

        &:hover {
          background: var(--ion-color-medium);
        }
      }

      ion-card {
        --background: var(--ion-color-dark);
      }

      .shifts-section h3 {
        color: var(--ion-color-light);
      }
    }
  `]
})
export class ShiftsPage implements OnInit {
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentMonth = '';
  currentYear = 0;
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  selectedDateShifts: Shift[] = [];

  constructor(private shiftService: ShiftService) {}

  ngOnInit() {
    this.initializeCalendar();
  }

  initializeCalendar() {
    const today = new Date();
    this.currentMonth = today.toLocaleString('default', { month: 'long' });
    this.currentYear = today.getFullYear();
    this.generateCalendarDays(today);
  }

  generateCalendarDays(date: Date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startingDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Get days from previous month
    const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1);
    const daysInPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const previousMonthDays = Array.from({ length: startingDayIndex }, (_, i) => {
      const day = daysInPreviousMonth - startingDayIndex + i + 1;
      return {
        date: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), day),
        otherMonth: true,
        hasShift: false
      };
    });

    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i + 1);
      return {
        date: currentDate,
        otherMonth: false,
        hasShift: this.hasShiftOnDate(currentDate)
      };
    });

    // Next month days to complete the grid
    const remainingDays = 42 - (previousMonthDays.length + currentMonthDays.length);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      return {
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1),
        otherMonth: true,
        hasShift: false
      };
    });

    this.calendarDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }

  previousMonth() {
    const previousMonth = new Date(this.currentYear, new Date(this.currentMonth + ' 1').getMonth() - 1);
    this.currentMonth = previousMonth.toLocaleString('default', { month: 'long' });
    this.currentYear = previousMonth.getFullYear();
    this.generateCalendarDays(previousMonth);
  }

  nextMonth() {
    const nextMonth = new Date(this.currentYear, new Date(this.currentMonth + ' 1').getMonth() + 1);
    this.currentMonth = nextMonth.toLocaleString('default', { month: 'long' });
    this.currentYear = nextMonth.getFullYear();
    this.generateCalendarDays(nextMonth);
  }

  hasShiftOnDate(date: Date): boolean {
    // Mock data - replace with actual shift data check
    return Math.random() > 0.7; // 30% chance of having a shift
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.loadShiftsForDate(date);
  }

  loadShiftsForDate(date: Date) {
    // Mock data - replace with actual API call
    this.selectedDateShifts = [
      {
        id: '1',
        date: date,
        startTime: new Date(date.setHours(9, 0)),
        endTime: new Date(date.setHours(17, 0)),
        location: 'Main Office',
        status: 'upcoming'
      }
    ];
  }

  getShiftIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'upcoming':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'calendar';
    }
  }

  getShiftColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'primary';
      case 'cancelled':
        return 'medium';
      default:
        return 'primary';
    }
  }

  addNewShift() {
    // Show modal for adding new shift
    console.log('Adding new shift...');
  }
} 