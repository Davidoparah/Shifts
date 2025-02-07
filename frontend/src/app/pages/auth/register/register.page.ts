import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <ion-list>
            <ion-item>
              <ion-label position="floating">Name</ion-label>
              <ion-input type="text" formControlName="name"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.errors?.['required']">
                Name is required
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input type="email" formControlName="email"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['required']">
                Email is required
              </ion-note>
              <ion-note slot="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']">
                Please enter a valid email
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input type="password" formControlName="password"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['required']">
                Password is required
              </ion-note>
              <ion-note slot="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['minlength']">
                Password must be at least 6 characters
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Confirm Password</ion-label>
              <ion-input type="password" formControlName="password_confirmation"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('password_confirmation')?.touched && registerForm.hasError('passwordMismatch')">
                Passwords do not match
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Phone</ion-label>
              <ion-input type="tel" formControlName="phone"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('phone')?.touched && registerForm.get('phone')?.errors?.['required']">
                Phone number is required
              </ion-note>
              <ion-note slot="error" *ngIf="registerForm.get('phone')?.touched && registerForm.get('phone')?.errors?.['pattern']">
                Please enter a valid phone number
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Address</ion-label>
              <ion-input type="text" formControlName="address"></ion-input>
              <ion-note slot="error" *ngIf="registerForm.get('address')?.touched && registerForm.get('address')?.errors?.['required']">
                Address is required
              </ion-note>
            </ion-item>

            <ion-item>
              <ion-label>Role</ion-label>
              <ion-select formControlName="role" (ionChange)="onRoleChange($event)">
                <ion-select-option value="worker">Worker</ion-select-option>
                <ion-select-option value="business_owner">Business Owner</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item *ngIf="selectedRole === 'business_owner'">
              <ion-label position="floating">Business Name</ion-label>
              <ion-input type="text" formControlName="business_name"></ion-input>
              <ion-note slot="error" *ngIf="showBusinessNameError">
                Business name is required for business owners
              </ion-note>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" [disabled]="registerForm.invalid || isLoading">
              {{ isLoading ? 'Creating account...' : 'Register' }}
            </ion-button>

            <ion-button expand="block" fill="clear" (click)="goToLogin()">
              Already have an account? Login
            </ion-button>
          </div>
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

    ion-button {
      margin-top: 16px;
    }

    ion-note {
      font-size: 12px;
      margin-top: 4px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterPage {
  registerForm!: FormGroup;
  isLoading = false;
  selectedRole: string = 'worker';
  showBusinessNameError = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['worker', Validators.required],
      business_name: [''],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Update business_name validation based on role
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const businessNameControl = this.registerForm.get('business_name');
      if (role === 'business_owner') {
        businessNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        businessNameControl?.clearValidators();
      }
      businessNameControl?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      const invalidFields = Object.keys(this.registerForm.controls)
        .filter(key => this.registerForm.controls[key].invalid)
        .map(key => key.replace('_', ' '))
        .join(', ');

      const toast = await this.toastCtrl.create({
        message: `Please check the following fields: ${invalidFields}`,
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    try {
      this.isLoading = true;
      const formData = this.registerForm.value;
      
      // Only include business_name if role is business_owner
      if (formData.role !== 'business_owner') {
        delete formData.business_name;
      }

      const response = await this.authService.register(formData).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Registration successful! Please log in.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.error?.message || error.message || 'Registration failed';
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  onRoleChange(event: any) {
    this.selectedRole = event.detail.value;
    const businessNameControl = this.registerForm.get('business_name');
    this.showBusinessNameError = this.selectedRole === 'business_owner' && 
                                businessNameControl?.errors?.['required'] && 
                                businessNameControl.touched;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
} 