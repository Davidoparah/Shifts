import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: `
    <ion-content>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Confirm Password</ion-label>
          <ion-input type="password" formControlName="password_confirmation"></ion-input>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="!registerForm.valid">
          Register
        </ion-button>
        <ion-button expand="block" fill="clear" routerLink="/auth/login">
          Back to Login
        </ion-button>
      </form>
    </ion-content>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (error) => console.error('Registration failed:', error)
      });
    }
  }
} 