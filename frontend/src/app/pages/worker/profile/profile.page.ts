import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  template: `
    <ion-content>
      <div class="profile-header">
        <ion-avatar>
          <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </ion-avatar>
        <h2>{{ profile.name }}</h2>
        <p>{{ profile.email }}</p>
        <ion-badge color="success">{{ profile.rating }} ★</ion-badge>
      </div>

      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Personal Information</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-label position="stacked">Phone Number</ion-label>
            <ion-input type="tel" [(ngModel)]="profile.phone"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Address</ion-label>
            <ion-input type="text" [(ngModel)]="profile.address"></ion-input>
          </ion-item>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label>Work Preferences</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-label>Maximum Distance</ion-label>
            <ion-select [(ngModel)]="profile.maxDistance">
              <ion-select-option value="5">5 miles</ion-select-option>
              <ion-select-option value="10">10 miles</ion-select-option>
              <ion-select-option value="15">15 miles</ion-select-option>
              <ion-select-option value="20">20 miles</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>Minimum Hourly Rate</ion-label>
            <ion-select [(ngModel)]="profile.minRate">
              <ion-select-option value="15">$15/hr</ion-select-option>
              <ion-select-option value="20">$20/hr</ion-select-option>
              <ion-select-option value="25">$25/hr</ion-select-option>
              <ion-select-option value="30">$30/hr</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>Available Days</ion-label>
            <ion-select [(ngModel)]="profile.availableDays" multiple="true">
              <ion-select-option value="monday">Monday</ion-select-option>
              <ion-select-option value="tuesday">Tuesday</ion-select-option>
              <ion-select-option value="wednesday">Wednesday</ion-select-option>
              <ion-select-option value="thursday">Thursday</ion-select-option>
              <ion-select-option value="friday">Friday</ion-select-option>
              <ion-select-option value="saturday">Saturday</ion-select-option>
              <ion-select-option value="sunday">Sunday</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label>Skills & Experience</ion-label>
          </ion-item-divider>

          <ion-item>
            <ion-label position="stacked">Skills</ion-label>
            <ion-chip *ngFor="let skill of profile.skills">
              <ion-label>{{ skill }}</ion-label>
              <ion-icon name="close-circle" (click)="removeSkill(skill)"></ion-icon>
            </ion-chip>
            <ion-button fill="clear" size="small" (click)="addSkill()">
              <ion-icon name="add"></ion-icon>
              Add Skill
            </ion-button>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" (click)="saveProfile()">
          Save Changes
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      padding: 32px 16px;
      text-align: center;
      background: var(--ion-color-light);
    }

    .profile-header ion-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
    }

    .profile-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: bold;
    }

    .profile-header p {
      margin: 8px 0;
      color: var(--ion-color-medium);
    }

    .profile-header ion-badge {
      font-size: 1rem;
      padding: 8px 16px;
    }

    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
      margin-top: 16px;
    }

    ion-chip {
      margin: 4px;
    }

    ion-button[size="small"] {
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    rating: 4.8,
    maxDistance: 10,
    minRate: 20,
    availableDays: ['monday', 'wednesday', 'friday'],
    skills: ['Customer Service', 'Cash Handling', 'Food Service']
  };

  constructor() {}

  ngOnInit() {
    // In a real app, we would fetch profile data from a service
  }

  removeSkill(skill: string) {
    this.profile.skills = this.profile.skills.filter(s => s !== skill);
  }

  addSkill() {
    // In a real app, we would show a modal or prompt to add a new skill
    console.log('Adding new skill');
  }

  async saveProfile() {
    // In a real app, we would save the profile data to a service
    console.log('Saving profile:', this.profile);
  }
} 