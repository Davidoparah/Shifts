import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RegisterPage {
  registerForm: FormGroup;
  isLoading = false;
  selectedRole: string = 'worker';
  showBusinessNameError = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      role: ['worker', Validators.required],
      business_name: [''],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });

    // Update business_name validation based on role
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const businessNameControl = this.registerForm.get('business_name');
      if (role === 'business_owner') {
        businessNameControl?.setValidators([Validators.required]);
      } else {
        businessNameControl?.clearValidators();
      }
      businessNameControl?.updateValueAndValidity();
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
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
      const formData = this.registerForm.value;
      
      // Only include business_name if role is business_owner
      if (formData.role !== 'business_owner') {
        delete formData.business_name;
      }

      console.log('Attempting registration with:', formData);
      
      const response = await firstValueFrom(this.authService.register(formData));
      console.log('Registration response:', response);

      if (response && response.user) {
        const toast = await this.toastCtrl.create({
          message: 'Registration successful!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        // Navigate based on role
        const role = response.user.role?.toLowerCase();
        switch (role) {
          case 'business_owner':
            await this.router.navigate(['/business-owner/shifts']);
            break;
          case 'worker':
            await this.router.navigate(['/worker/available-shifts']);
            break;
          default:
            await this.router.navigate(['/auth/login']);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const toast = await this.toastCtrl.create({
        message: error.message || 'Registration failed',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  onRoleChange(event: any) {
    this.selectedRole = event.detail.value;
    // Update business name validation
    const businessNameControl = this.registerForm.get('business_name');
    this.showBusinessNameError = this.selectedRole === 'business_owner' && 
                                businessNameControl?.errors?.['required'] && 
                                businessNameControl.touched;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
} 