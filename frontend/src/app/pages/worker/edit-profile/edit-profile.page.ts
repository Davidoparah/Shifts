import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { WorkerService, WorkerProfile } from '../../../services/worker.service';

@Component({
  selector: 'app-edit-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
        <ion-item>
          <ion-label position="floating">Name</ion-label>
          <ion-input formControlName="name" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Phone</ion-label>
          <ion-input formControlName="phone" type="tel"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Address</ion-label>
          <ion-textarea formControlName="address" rows="3"></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Bio</ion-label>
          <ion-textarea formControlName="bio" rows="4"></ion-textarea>
        </ion-item>

        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          [disabled]="!profileForm.valid"
        >
          Update Profile
        </ion-button>
      </form>

      <ion-spinner *ngIf="isLoading" class="spinner-center"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    ion-item {
      margin-bottom: 16px;
    }
    .spinner-center {
      display: block;
      margin: auto;
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditProfilePage implements OnInit {
  profileForm: FormGroup;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private workerService: WorkerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      bio: ['']
    });
  }

  async ngOnInit() {
    try {
      const profile = await this.workerService.getProfile().toPromise();
      if (profile) {
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load profile',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      try {
        await this.workerService.updateProfile(this.profileForm.value).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Profile updated successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/worker']);
      } catch (error) {
        console.error('Error updating profile:', error);
        const toast = await this.toastCtrl.create({
          message: 'Failed to update profile',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }
} 