import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  template: `
    <ion-content class="ion-padding">
      <div class="auth-container">
        <h1 class="ion-text-center">Set New Password</h1>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-label position="floating">New Password</ion-label>
            <ion-input 
              type="password" 
              formControlName="password"
              placeholder="Enter your new password"
            ></ion-input>
            <ion-note slot="error" *ngIf="resetPasswordForm.get('password')?.touched && resetPasswordForm.get('password')?.errors">
              Password must be at least 6 characters
            </ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Confirm Password</ion-label>
            <ion-input 
              type="password" 
              formControlName="password_confirmation"
              placeholder="Confirm your new password"
            ></ion-input>
            <ion-note slot="error" *ngIf="resetPasswordForm.get('password_confirmation')?.touched && resetPasswordForm.get('password_confirmation')?.errors?.['mismatch']">
              Passwords do not match
            </ion-note>
          </ion-item>

          <ion-button expand="block" type="submit" [disabled]="!resetPasswordForm.valid" class="ion-margin-top">
            Reset Password
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required]
    });

    // Set up password confirmation validation
    this.resetPasswordForm.get('password_confirmation')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });

    this.resetPasswordForm.get('password')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.showError('Invalid reset link');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  validatePasswordMatch() {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmation = this.resetPasswordForm.get('password_confirmation')?.value;
    const confirmationControl = this.resetPasswordForm.get('password_confirmation');

    if (confirmationControl && password !== confirmation) {
      confirmationControl.setErrors({ mismatch: true });
    } else if (confirmationControl) {
      // Only clear mismatch error, keep other errors if any
      const currentErrors = confirmationControl.errors;
      if (currentErrors) {
        delete currentErrors['mismatch'];
        confirmationControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
    }
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      try {
        const response = await this.authService.resetPassword(
          this.token,
          this.resetPasswordForm.value.password,
          this.resetPasswordForm.value.password_confirmation
        ).toPromise();
        
        const alert = await this.alertController.create({
          header: 'Success',
          message: response?.message || 'Your password has been reset successfully.',
          buttons: ['OK']
        });
        await alert.present();

        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        await this.showError(error.error || 'An error occurred. Please try again.');
      }
    }
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
} 