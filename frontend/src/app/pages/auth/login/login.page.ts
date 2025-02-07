import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AuthResponse } from '../../../models/user.model';
import { firstValueFrom } from 'rxjs';

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
  loginForm = this.initForm();
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      email: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
      password: [{ value: '', disabled: false }, [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in all required fields correctly',
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Disable form controls while loading
      this.loginForm.disable();
      
      const { email, password } = this.loginForm.getRawValue();
      console.log('Attempting login with:', { email });
      
      const response = await firstValueFrom(this.authService.login(email, password));
      console.log('Login response:', response);

      if (response && response.user && response.user.role) {
        // Navigate based on role
        const role = response.user.role.toLowerCase();
        console.log('User role:', role);
        
        switch (role) {
          case 'business_owner':
            await this.router.navigate(['/business-owner/shifts']);
            break;
          case 'worker':
            await this.router.navigate(['/worker/available-shifts']);
            break;
          case 'admin':
            await this.router.navigate(['/admin/dashboard']);
            break;
          default:
            console.error('Unknown user role:', role);
            const toast = await this.toastCtrl.create({
              message: 'Invalid user role',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();
        }
      } else {
        console.error('Invalid response format:', response);
        const toast = await this.toastCtrl.create({
          message: 'Invalid response from server',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || error.message || 'Login failed';
      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
      // Re-enable form controls after loading
      this.loginForm.enable();
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