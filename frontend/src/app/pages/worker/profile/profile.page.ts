import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, ActionSheetController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService, WorkerDocument } from '../../../services/worker.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { WorkerProfile } from '../../../core/models/user.model';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface RequiredDocument {
  type: string;
  title: string;
  status: 'pending' | 'uploaded' | 'expired';
  expiry_date: string | null;
  file_url?: string;
}

@Component({
  selector: 'app-document-viewer-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="modalCtrl.dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="viewer-content">
      <div class="document-container">
        <iframe [src]="safeUrl" class="document-frame"></iframe>
      </div>
    </ion-content>
  `,
  styles: [`
    .viewer-content {
      --background: #f4f5f8;
    }
    .document-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    .document-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: #fff;
    }
  `],
  standalone: true,
  imports: [IonicModule]
})
export class DocumentViewerModalComponent {
  safeUrl: SafeResourceUrl;
  title: string;

  constructor(
    public modalCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.title = '';
  }

  ngOnInit() {
    // The URL will be passed in through componentProps
  }
}

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Worker Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Profile Photo Section -->
      <div class="profile-photo-container">
        <div class="profile-photo" [style.backgroundImage]="'url(' + (profile.photo_url || 'assets/default-avatar.png') + ')'">
          <ion-button fill="clear" (click)="updateProfilePhoto()">
            <ion-icon slot="icon-only" name="camera"></ion-icon>
          </ion-button>
        </div>
        <h2 class="ion-text-center">{{ authService.getCurrentUser()?.first_name }} {{ authService.getCurrentUser()?.last_name }}</h2>
      </div>

      <form #profileForm="ngForm" (ngSubmit)="saveProfile()">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Phone Number*</ion-label>
            <ion-input
              type="tel"
              [(ngModel)]="profile.phone"
              name="phone"
              required
              #phone="ngModel"
            ></ion-input>
            <ion-note color="danger" *ngIf="phone.invalid && (phone.dirty || phone.touched)">
              Phone number is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Address*</ion-label>
            <ion-textarea
              [(ngModel)]="profile.address"
              name="address"
              required
              rows="3"
              #address="ngModel"
            ></ion-textarea>
            <ion-note color="danger" *ngIf="address.invalid && (address.dirty || address.touched)">
              Address is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Bio*</ion-label>
            <ion-textarea
              [(ngModel)]="profile.bio"
              name="bio"
              required
              placeholder="Tell us about your experience..."
              rows="4"
              #bio="ngModel"
            ></ion-textarea>
            <ion-note color="danger" *ngIf="bio.invalid && (bio.dirty || bio.touched)">
              Bio is required
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Hourly Rate*</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="profile.hourly_rate"
              name="hourly_rate"
              required
              min="1"
              #hourlyRate="ngModel"
            ></ion-input>
            <ion-note color="danger" *ngIf="hourlyRate.invalid && (hourlyRate.dirty || hourlyRate.touched)">
              Hourly rate must be greater than 0
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Skills*</ion-label>
            <ion-select
              [(ngModel)]="profile.skills"
              name="skills"
              multiple="true"
              required
              #skills="ngModel"
            >
              <ion-select-option value="security">Security</ion-select-option>
              <ion-select-option value="first_aid">First Aid</ion-select-option>
              <ion-select-option value="crowd_control">Crowd Control</ion-select-option>
              <ion-select-option value="cctv">CCTV Operation</ion-select-option>
              <ion-select-option value="access_control">Access Control</ion-select-option>
            </ion-select>
            <ion-note color="danger" *ngIf="skills.invalid && (skills.dirty || skills.touched)">
              Please select at least one skill
            </ion-note>
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="!profileForm.form.valid || isLoading">
            {{ isLoading ? 'Saving...' : 'Save Profile' }}
          </ion-button>
        </div>
      </form>

      <!-- Documents Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Required Documents</ion-card-title>
          <ion-card-subtitle>Upload your verification documents</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let doc of requiredDocuments">
              <ion-label>
                <h3>{{doc.title}}</h3>
                <p *ngIf="doc.status === 'pending'">Status: <ion-text color="warning">Pending Upload</ion-text></p>
                <p *ngIf="doc.status === 'uploaded'">Status: <ion-text color="success">Uploaded</ion-text></p>
                <p *ngIf="doc.status === 'expired'">Status: <ion-text color="danger">Expired</ion-text></p>
                <p *ngIf="doc.expiry_date">Expires: {{doc.expiry_date | date}}</p>
                <p *ngIf="doc.file_url">File: {{getFileName(doc.file_url)}}</p>
              </ion-label>
              <div slot="end" class="document-actions">
                <ion-button 
                  *ngIf="doc.file_url"
                  fill="clear"
                  size="small"
                  (click)="viewDocument(doc)">
                  <ion-icon slot="icon-only" name="eye-outline"></ion-icon>
                </ion-button>
                <ion-button 
                  *ngIf="doc.file_url"
                  fill="clear"
                  color="danger"
                  size="small"
                  (click)="deleteDocument(doc)">
                  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                </ion-button>
                <ion-button 
                  size="small" 
                  [color]="doc.status === 'uploaded' ? 'success' : 'primary'"
                  (click)="uploadDocument(doc.type)">
                  <ion-icon slot="start" [name]="doc.status === 'uploaded' ? 'sync' : 'cloud-upload'"></ion-icon>
                  {{doc.status === 'uploaded' ? 'Update' : 'Upload'}}
                </ion-button>
              </div>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: var(--ion-color-light);
    }

    .profile-photo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;
    }

    .profile-photo {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      position: relative;
      border: 3px solid var(--ion-color-primary);
      margin-bottom: 10px;

      ion-button {
        position: absolute;
        bottom: 0;
        right: 0;
        --padding-start: 8px;
        --padding-end: 8px;
        --padding-top: 8px;
        --padding-bottom: 8px;
        margin: 0;
        
        ion-icon {
          font-size: 20px;
        }
      }
    }

    form {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    ion-item {
      --padding-start: 0;
      --border-color: var(--ion-color-medium-shade);
      --background: transparent;
      margin-bottom: 8px;
    }

    ion-card {
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    ion-card-header {
      background: var(--ion-color-primary);
      color: white;
      
      ion-card-title {
        color: white;
      }
      
      ion-card-subtitle {
        color: rgba(255,255,255,0.8);
      }
    }

    ion-button[type="submit"] {
      margin-top: 16px;
    }

    ion-note {
      padding-left: 16px;
      margin-top: 4px;
    }

    h3 {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .document-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    ion-button[fill="clear"] {
      --padding-start: 4px;
      --padding-end: 4px;
      height: 30px;
    }

    /* Document viewer modal styles */
    :host ::ng-deep .document-viewer-modal {
      --height: 90%;
      --width: 90%;
      --border-radius: 8px;
      --backdrop-opacity: 0.6;
    }

    :host ::ng-deep .document-viewer-modal ion-content {
      --background: #f4f5f8;
    }

    :host ::ng-deep .document-viewer-modal.fullscreen-modal {
      --height: 100%;
      --width: 100%;
      --border-radius: 0;
    }

    :host ::ng-deep .document-viewer-modal .document-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfilePage implements OnInit {
  @ViewChild('profileForm') profileForm!: NgForm;
  
  profile: Partial<WorkerProfile> = {
    phone: '',
    address: '',
    bio: '',
    hourly_rate: 1,
    skills: [],
    photo_url: ''
  };
  
  requiredDocuments: RequiredDocument[] = [
    { 
      type: 'security_license',
      title: 'Security License',
      status: 'pending',
      expiry_date: null
    },
    { 
      type: 'id_verification',
      title: 'ID Verification',
      status: 'pending',
      expiry_date: null
    },
    { 
      type: 'police_check',
      title: 'Police Check',
      status: 'pending',
      expiry_date: null
    },
    { 
      type: 'first_aid',
      title: 'First Aid Certificate',
      status: 'pending',
      expiry_date: null
    }
  ];
  
  isLoading = false;

  constructor(
    private workerService: WorkerService,
    public authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        await this.router.navigate(['/auth/login']);
        return;
      }

      const response = await firstValueFrom(this.workerService.getProfile());
      if (response?.worker_profile) {
        this.profile = response.worker_profile;
        
        // Load documents
        const documents = await firstValueFrom(this.workerService.getDocuments());
        if (documents) {
          this.updateDocumentStatuses(documents);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      await this.presentToast('Error loading profile. Please try again.', 'danger');
    }
  }

  updateDocumentStatuses(documents: WorkerDocument[]) {
    documents.forEach(doc => {
      const requiredDoc = this.requiredDocuments.find(rd => rd.type === doc.type);
      if (requiredDoc) {
        requiredDoc.status = doc.status || 'uploaded';
        requiredDoc.expiry_date = doc.expiry_date || null;
        requiredDoc.file_url = doc.file_url;
      }
    });
  }

  async updateProfilePhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Update Profile Photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.uploadPhoto('camera');
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => {
            this.uploadPhoto('gallery');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async uploadPhoto(source: 'camera' | 'gallery') {
    const loading = await this.loadingCtrl.create({
      message: 'Uploading photo...'
    });
    await loading.present();

    try {
      // TODO: Implement photo upload using Capacitor Camera API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated upload
      await this.presentToast('Profile photo updated successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      await this.presentToast('Failed to upload photo', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async uploadDocument(type: string) {
    console.log('Starting document upload for type:', type);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        await this.presentToast('File size must be less than 5MB', 'danger');
        return;
      }

      // Show loading indicator
      const loading = await this.loadingCtrl.create({
        message: 'Uploading document...'
      });
      await loading.present();

      try {
        // Get expiry date for documents that require it
        let expiryDate: string | undefined;
        if (['license', 'certification'].includes(type)) {
          const { data } = await this.alertController.create({
            header: 'Document Expiry Date',
            inputs: [
              {
                name: 'expiryDate',
                type: 'date',
                min: new Date().toISOString().split('T')[0]
              }
            ],
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel'
              },
              {
                text: 'Upload',
                role: 'confirm'
              }
            ]
          }).then(alert => {
            alert.present();
            return alert.onDidDismiss();
          });

          if (!data || !data.values?.expiryDate) {
            await loading.dismiss();
            return;
          }
          expiryDate = data.values.expiryDate;
        }

        // Upload document
        const response = await this.workerService.uploadDocument(type, file, expiryDate).toPromise();
        console.log('Upload successful:', response);

        // Update document status
        const docIndex = this.requiredDocuments.findIndex(doc => doc.type === type);
        if (docIndex !== -1) {
          this.requiredDocuments[docIndex] = {
            ...this.requiredDocuments[docIndex],
            status: 'uploaded',
            file_url: response?.file_url
          };
        }

        await this.presentToast('Document uploaded successfully', 'success');
      } catch (error) {
        console.error('Upload error:', error);
        await this.presentToast('Failed to upload document. Please try again.', 'danger');
      } finally {
        await loading.dismiss();
      }
    };
    input.click();
  }

  async viewDocument(doc: RequiredDocument) {
    if (!doc.file_url) {
      await this.presentToast('Document not available', 'warning');
      return;
    }

    const isPDF = doc.file_url.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_url);

    if (!isPDF && !isImage) {
      window.open(doc.file_url, '_blank');
      return;
    }

    let viewerUrl = doc.file_url;
    if (isPDF) {
      // Use PDF.js viewer for PDFs
      viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(doc.file_url)}`;
    }

    const modal = await this.modalCtrl.create({
      component: DocumentViewerModalComponent,
      componentProps: {
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl),
        title: `${doc.title} - ${this.getFileName(doc.file_url)}`
      },
      cssClass: ['document-viewer-modal', 'fullscreen-modal']
    });

    await modal.present();
  }

  async saveProfile() {
    if (!this.profileForm.valid) {
      await this.presentToast('Please fill in all required fields correctly', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      console.log('Sending profile update with data:', this.profile);
      
      const response = await firstValueFrom(this.workerService.updateProfile(this.profile));
      console.log('Profile update response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.worker_profile) {
        throw new Error('No worker profile in response');
      }

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user found');
      }

      this.authService.updateCurrentUser({
        ...currentUser,
        worker_profile: response.worker_profile
      });

      await this.presentToast('Profile saved successfully', 'success');
      await this.router.navigate(['/worker/available-shifts']);
      
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error status:', error.status);
      console.error('Error response:', error.error);
      
      let errorMessage = 'Error saving profile';
      
      if (error.error?.errors) {
        errorMessage = Array.isArray(error.error.errors) 
          ? error.error.errors.join(', ') 
          : error.error.errors;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.presentToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  getFileName(url: string): string {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove any query parameters
      return fileName.split('?')[0];
    } catch (error) {
      return 'Unknown file';
    }
  }

  async deleteDocument(doc: RequiredDocument) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete this ${doc.title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Deleting document...'
            });
            await loading.present();

            try {
              await firstValueFrom(this.workerService.deleteDocument(doc.type));
              
              // Update local state
              const docIndex = this.requiredDocuments.findIndex(d => d.type === doc.type);
              if (docIndex !== -1) {
                this.requiredDocuments[docIndex] = {
                  ...this.requiredDocuments[docIndex],
                  status: 'pending',
                  file_url: undefined,
                  expiry_date: null
                };
              }
              
              await this.presentToast('Document deleted successfully', 'success');
            } catch (error) {
              console.error('Error deleting document:', error);
              await this.presentToast('Failed to delete document. Please try again.', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }
} 