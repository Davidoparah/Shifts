import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>
            <h1>My Schedule</h1>
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>
            <h2>This Week</h2>
            <p>No shifts scheduled</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Next Week</h2>
            <p>No shifts scheduled</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class SchedulePage {} 