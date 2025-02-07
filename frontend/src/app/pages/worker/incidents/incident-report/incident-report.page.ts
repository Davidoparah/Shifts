import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IncidentService, CreateIncidentDTO } from '../../../../services/incident.service';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeCircle, cameraOutline, chevronBack } from 'ionicons/icons';

@Component({
  selector: 'app-incident-report',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/worker/incidents"></ion-back-button>
        </ion-buttons>
        <ion-title>Report Incident</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form #form="ngForm" (ngSubmit)="submitReport()">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Title*</ion-label>
            <ion-input
              [(ngModel)]="incident.title"
              name="title"
              required
              placeholder="Brief description of the incident"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Location*</ion-label>
            <ion-input
              [(ngModel)]="incident.location"
              name="location"
              required
              placeholder="Where did this occur?"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Severity*</ion-label>
            <ion-select [(ngModel)]="incident.severity" name="severity" required>
              <ion-select-option value="low">Low</ion-select-option>
              <ion-select-option value="medium">Medium</ion-select-option>
              <ion-select-option value="high">High</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description*</ion-label>
            <ion-textarea
              [(ngModel)]="incident.description"
              name="description"
              required
              rows="4"
              placeholder="Provide detailed information about what happened"
            ></ion-textarea>
          </ion-item>

          <ion-item lines="none">
            <ion-label>Photos</ion-label>
            <ion-button slot="end" (click)="takePicture()" size="small" fill="outline" [disabled]="isSubmitting">
              <ion-icon name="camera-outline" slot="start"></ion-icon>
              Add Photo
            </ion-button>
          </ion-item>

          <ion-grid *ngIf="photos.length > 0">
            <ion-row>
              <ion-col size="4" *ngFor="let photo of photos; let i = index">
                <div class="photo-container">
                  <ion-img [src]="photo"></ion-img>
                  <ion-button fill="clear" color="danger" class="delete-button" (click)="removePhoto(i)">
                    <ion-icon name="close-circle"></ion-icon>
                  </ion-button>
                  <ion-spinner *ngIf="isUploadingPhoto && i === photos.length - 1" class="upload-spinner"></ion-spinner>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="!form.valid || isSubmitting || isUploadingPhoto">
            <ion-spinner *ngIf="isSubmitting"></ion-spinner>
            <span *ngIf="!isSubmitting">Submit Report</span>
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .photo-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--ion-color-light);
    }

    ion-img {
      width: 100%;
      height: 100%;
      object-fit: cover;

      &::part(image) {
        border-radius: 8px;
      }
    }

    .delete-button {
      position: absolute;
      top: 0;
      right: 0;
      margin: 0;
      --padding-start: 4px;
      --padding-end: 4px;
      height: 24px;
      
      ion-icon {
        font-size: 24px;
      }
    }

    .upload-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    ion-spinner {
      margin-right: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class IncidentReportPage {
  incident: CreateIncidentDTO = {
    title: '',
    description: '',
    location: '',
    severity: 'low',
    photos: []
  };

  photos: string[] = [];
  isSubmitting = false;
  isUploadingPhoto = false;

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      'close-circle': closeCircle,
      'camera-outline': cameraOutline,
      'chevron-back': chevronBack
    });
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        this.isUploadingPhoto = true;
        const photoUrl = `data:image/jpeg;base64,${image.base64String}`;
        this.photos.push(photoUrl);

        try {
          // Convert base64 to Blob
          const response = await fetch(photoUrl);
          const blob = await response.blob();
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

          // Upload the photo
          const result = await firstValueFrom(this.incidentService.uploadPhoto(file));
          
          // Replace the data URL with the Cloudinary URL
          const index = this.photos.indexOf(photoUrl);
          if (index !== -1) {
            this.photos[index] = result.url;
            this.incident.photos.push(result.url);
          }

          const toast = await this.toastController.create({
            message: 'Photo uploaded successfully',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        } catch (error) {
          console.error('Error uploading photo:', error);
          // Remove the photo if upload failed
          const index = this.photos.indexOf(photoUrl);
          if (index !== -1) {
            this.photos.splice(index, 1);
          }
          
          const toast = await this.toastController.create({
            message: 'Failed to upload photo. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        } finally {
          this.isUploadingPhoto = false;
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      const toast = await this.toastController.create({
        message: 'Failed to take photo. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  removePhoto(index: number) {
    this.photos.splice(index, 1);
    this.incident.photos.splice(index, 1);
  }

  async submitReport() {
    if (this.isSubmitting || this.isUploadingPhoto) return;

    this.isSubmitting = true;
    try {
      await firstValueFrom(this.incidentService.createIncident(this.incident));
      
      const toast = await this.toastController.create({
        message: 'Incident reported successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      await this.router.navigate(['/worker/incidents']);
    } catch (error) {
      console.error('Error submitting report:', error);
      const toast = await this.toastController.create({
        message: 'Failed to submit report. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSubmitting = false;
    }
  }
} 