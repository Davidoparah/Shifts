import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.loginForm.invalid) return;

    try {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      const response = await this.authService.login(email, password).toPromise() as AuthResponse;

      if (response.user.role === 'worker') {
        await this.router.navigate(['/worker']);
      } else if (response.user.role === 'business_owner') {
        await this.router.navigate(['/business-owner']);
      } else if (response.user.role === 'admin') {
        await this.router.navigate(['/admin']);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Invalid email or password';
    } finally {
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  dismissError() {
    this.errorMessage = '';
  }
} 