import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Forgot Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
        <p class="instructions">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
        </ion-item>
        <div class="validation-error" *ngIf="forgotPasswordForm.get('email')?.touched && forgotPasswordForm.get('email')?.errors?.['required']">
          Email is required
        </div>
        <div class="validation-error" *ngIf="forgotPasswordForm.get('email')?.touched && forgotPasswordForm.get('email')?.errors?.['email']">
          Please enter a valid email
        </div>

        <ion-button expand="block" type="submit" [disabled]="!forgotPasswordForm.valid || isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Reset Instructions' }}
        </ion-button>

        <div class="success-message" *ngIf="successMessage">
          {{ successMessage }}
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <ion-button expand="block" fill="clear" routerLink="/auth/login">
          Back to Login
        </ion-button>
      </form>

      <ion-spinner *ngIf="isLoading" class="spinner-center"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    .validation-error {
      color: var(--ion-color-danger);
      font-size: 0.8em;
      margin: 5px 0 10px 16px;
    }

    .error-message {
      color: var(--ion-color-danger);
      text-align: center;
      margin: 15px 0;
    }

    .success-message {
      color: var(--ion-color-success);
      text-align: center;
      margin: 15px 0;
    }

    .spinner-center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .instructions {
      text-align: center;
      color: var(--ion-color-medium);
      margin: 20px 0;
    }

    form {
      max-width: 400px;
      margin: 0 auto;
    }

    ion-button {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class ForgotPasswordPage {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        await this.authService.forgotPassword(this.forgotPasswordForm.value.email).toPromise();
        this.successMessage = 'Password reset instructions have been sent to your email';
        this.forgotPasswordForm.reset();
      } catch (error: any) {
        this.errorMessage = error.error?.error || 'An error occurred while processing your request';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
} 