import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Worker Profile Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-button expand="block" (click)="verifyProfile()">
            Verify/Create Worker Profile
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfilePage implements OnInit {
  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.verifyProfile();
  }

  async verifyProfile() {
    try {
      await this.authService.ensureWorkerProfile().toPromise();
      const toast = await this.toastController.create({
        message: 'Worker profile verified successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error verifying worker profile',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
} 