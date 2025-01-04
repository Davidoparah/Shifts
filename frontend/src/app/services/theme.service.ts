import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Initialize dark mode based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setDarkMode(prefersDark.matches);

    // Listen for system dark mode changes
    prefersDark.addEventListener('change', (e) => {
      this.setDarkMode(e.matches);
    });

    // Check for saved preference
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      this.setDarkMode(savedPreference === 'true');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }

  setDarkMode(enable: boolean) {
    this.darkMode.next(enable);
    document.body.classList.toggle('dark', enable);
    localStorage.setItem('darkMode', enable.toString());
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode.value);
  }
} 