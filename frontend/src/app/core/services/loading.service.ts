import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingMap = new Map<string, HTMLIonLoadingElement>();
  private loadingState = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingState.asObservable();

  constructor(private loadingController: LoadingController) {}

  async show(id: string = 'global', message: string = 'Please wait...') {
    this.loadingState.next(true);
    
    const loading = await this.loadingController.create({
      id,
      message,
      spinner: 'circular'
    });

    this.loadingMap.set(id, loading);
    await loading.present();
  }

  async hide(id: string = 'global') {
    if (this.loadingMap.has(id)) {
      const loading = this.loadingMap.get(id);
      await loading?.dismiss();
      this.loadingMap.delete(id);
    }

    if (this.loadingMap.size === 0) {
      this.loadingState.next(false);
    }
  }

  isLoading(): boolean {
    return this.loadingState.value;
  }
} 