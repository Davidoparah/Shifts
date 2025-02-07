import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  success: string;
  warning: string;
  danger: string;
  dark: string;
  medium: string;
  light: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  
  // Default color palette
  private colors: ThemeColors = {
    primary: '#3880ff',    // Main brand color
    secondary: '#3dc2ff',  // Secondary brand color
    tertiary: '#5260ff',   // Accent color
    success: '#2dd36f',    // Success states
    warning: '#ffc409',    // Warning states
    danger: '#eb445a',     // Error states
    dark: '#222428',       // Dark text/backgrounds
    medium: '#92949c',     // Medium emphasis
    light: '#f4f5f8'       // Light backgrounds
  };

  constructor() {
    this.loadThemePreference();
  }

  private loadThemePreference() {
    try {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      this.setDarkMode(darkMode);
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  }

  setDarkMode(enable: boolean) {
    document.body.classList.toggle('dark', enable);
    try {
      localStorage.setItem('darkMode', enable.toString());
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
    this.isDarkMode.next(enable);
  }

  getDarkMode() {
    return this.isDarkMode.asObservable();
  }

  getColor(name: keyof ThemeColors): string {
    return this.colors[name];
  }

  getAllColors(): ThemeColors {
    return { ...this.colors };
  }

  // Apply theme to specific platform
  applyPlatformTheme(platform: 'admin' | 'business' | 'worker') {
    const root = document.documentElement;
    
    switch (platform) {
      case 'admin':
        root.style.setProperty('--ion-color-primary', '#3880ff');
        root.style.setProperty('--ion-color-primary-rgb', '56,128,255');
        break;
      case 'business':
        root.style.setProperty('--ion-color-primary', '#2dd36f');
        root.style.setProperty('--ion-color-primary-rgb', '45,211,111');
        break;
      case 'worker':
        root.style.setProperty('--ion-color-primary', '#5260ff');
        root.style.setProperty('--ion-color-primary-rgb', '82,96,255');
        break;
    }
  }
} 