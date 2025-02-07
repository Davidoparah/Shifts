import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-businesses',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Businesses Management</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Businesses List Coming Soon</h2>
            <p>This feature is under development</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class BusinessesPage implements OnInit {
  constructor() {}

  ngOnInit() {}
} 