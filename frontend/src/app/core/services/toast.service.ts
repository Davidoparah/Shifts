import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async success(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toastDuration,
      position: 'bottom',
      color: 'success',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async error(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toastDuration,
      position: 'bottom',
      color: 'danger',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async warning(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toastDuration,
      position: 'bottom',
      color: 'warning',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async info(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toastDuration,
      position: 'bottom',
      color: 'primary',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
} 