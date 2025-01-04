import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <ion-content class="ion-padding">
      <div class="auth-container">
        <h1 class="ion-text-center">Reset Password</h1>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input 
              type="email" 
              formControlName="email"
              placeholder="Enter your email address"
            ></ion-input>
            <ion-note slot="error" *ngIf="forgotPasswordForm.get('email')?.touched && forgotPasswordForm.get('email')?.errors">
              Please enter a valid email address
            </ion-note>
          </ion-item>

          <ion-button expand="block" type="submit" [disabled]="!forgotPasswordForm.valid" class="ion-margin-top">
            Send Reset Instructions
          </ion-button>

          <ion-button expand="block" fill="clear" (click)="goToLogin()">
            Back to Login
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }

    ion-item {
      --padding-start: 0;
      --border-color: #ddd;
      margin-bottom: 16px;
    }

    ion-label {
      color: #333;
      font-weight: 500;
    }

    ion-input {
      --padding-start: 8px;
      --placeholder-color: #999;
    }

    ion-button {
      margin-top: 24px;
      --border-radius: 8px;
      text-transform: uppercase;
      font-weight: 600;
    }

    ion-note {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin-top: 4px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      try {
        const response = await this.authService.forgotPassword(this.forgotPasswordForm.value.email).toPromise();
        
        const alert = await this.alertController.create({
          header: 'Success',
          message: response?.message || 'Password reset instructions have been sent to your email.',
          buttons: ['OK']
        });
        await alert.present();

        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.error || 'An error occurred. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
} 