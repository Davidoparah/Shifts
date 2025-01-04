import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  template: `
    <ion-content class="ion-padding">
      <div class="auth-container">
        <h1 class="ion-text-center">{{ isLoginMode ? 'Login' : 'Register' }}</h1>
        
        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input type="email" formControlName="email" placeholder="Enter your email"></ion-input>
          </ion-item>

          <ion-item *ngIf="!isLoginMode">
            <ion-label position="floating">Name</ion-label>
            <ion-input type="text" formControlName="name" placeholder="Enter your full name"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input type="password" formControlName="password" placeholder="Enter your password"></ion-input>
          </ion-item>

          <ion-item *ngIf="!isLoginMode">
            <ion-label position="floating">Confirm Password</ion-label>
            <ion-input type="password" formControlName="password_confirmation" placeholder="Confirm your password"></ion-input>
          </ion-item>

          <ion-item *ngIf="!isLoginMode">
            <ion-label>Role</ion-label>
            <ion-select formControlName="role" placeholder="Select your role">
              <ion-select-option value="worker">Worker</ion-select-option>
              <ion-select-option value="business_owner">Business Owner</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item *ngIf="!isLoginMode && showBusinessField">
            <ion-label position="floating">Business Name</ion-label>
            <ion-input type="text" formControlName="business" placeholder="Enter your business name"></ion-input>
          </ion-item>

          <ion-button expand="block" type="submit" [disabled]="!authForm.valid" class="ion-margin-top">
            {{ isLoginMode ? 'Login' : 'Register' }}
          </ion-button>

          <ion-button expand="block" fill="clear" (click)="toggleMode()" tabindex="0">
            {{ isLoginMode ? 'Create an account' : 'Already have an account?' }}
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
      margin-bottom: 16px;
    }

    h1 {
      margin-bottom: 24px;
    }

    ion-select {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class AuthPage implements OnInit {
  authForm!: FormGroup;
  isLoginMode = true;
  showBusinessField = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.isLoginMode = this.route.snapshot.url[0]?.path === 'login';
    if (!this.isLoginMode) {
      this.updateFormForRegister();
    }
  }

  private createForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private updateFormForRegister() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      role: ['worker', Validators.required],
      business: ['']
    });

    this.authForm.get('role')?.valueChanges.subscribe((role: User['role']) => {
      this.showBusinessField = role === 'business_owner';
      const businessControl = this.authForm.get('business');
      if (businessControl) {
        if (this.showBusinessField) {
          businessControl.setValidators([Validators.required]);
        } else {
          businessControl.clearValidators();
          businessControl.setValue('');
        }
        businessControl.updateValueAndValidity();
      }
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      if (this.isLoginMode) {
        const { email, password } = this.authForm.value;
        this.authService.login({ email, password }).subscribe({
          next: () => {
            const user = this.authService.getCurrentUser();
            if (user) {
              switch (user.role) {
                case 'worker':
                  this.router.navigate(['/worker']);
                  break;
                case 'business_owner':
                  this.router.navigate(['/business-owner']);
                  break;
                case 'platform_owner':
                  this.router.navigate(['/platform-owner']);
                  break;
                default:
                  this.router.navigate(['/']);
              }
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            // Add user feedback for login errors
            if (error.status === 401) {
              // Handle invalid credentials
              alert('Invalid email or password');
            } else if (error.status === 0) {
              // Handle CORS or network errors
              alert('Network error. Please try again later.');
            } else {
              // Handle other errors
              alert('An error occurred. Please try again.');
            }
          }
        });
      } else {
        this.authService.register(this.authForm.value).subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: (error) => {
            console.error('Registration error:', error);
            // Add user feedback for registration errors
            if (error.status === 422) {
              // Handle validation errors
              alert('Registration failed. Please check your information.');
            } else {
              // Handle other errors
              alert('An error occurred. Please try again.');
            }
          }
        });
      }
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.createForm();
    } else {
      this.updateFormForRegister();
    }
    this.router.navigate([this.isLoginMode ? '/auth/login' : '/auth/register']);
  }
}