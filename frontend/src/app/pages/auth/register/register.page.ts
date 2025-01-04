import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AuthResponse } from '../../../services/auth.service';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showBusinessNameError = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['worker', [Validators.required]],
      businessName: ['']
    });

    this.registerForm.get('userType')?.valueChanges.subscribe(value => {
      const businessNameControl = this.registerForm.get('businessName');
      if (value === 'business_owner') {
        businessNameControl?.setValidators([Validators.required]);
      } else {
        businessNameControl?.clearValidators();
      }
      businessNameControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.user?.role) {
      this.navigateByRole(currentUser.user.role);
    }
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const userType = this.registerForm.get('userType')?.value;
    const businessName = this.registerForm.get('businessName')?.value;

    if (userType === 'business_owner' && !businessName) {
      this.showBusinessNameError = true;
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Creating account...'
    });
    await loading.present();

    try {
      const response = await this.authService.register(this.registerForm.value).toPromise() as AuthResponse;
      if (response?.user?.role) {
        await loading.dismiss();
        this.navigateByRole(response.user.role);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: error.error?.message || 'Registration failed. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  private navigateByRole(role: string) {
    switch (role) {
      case 'worker':
        this.router.navigate(['/worker']);
        break;
      case 'business_owner':
        this.router.navigate(['/business-owner']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
} 