import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <ion-app [class.platform-admin]="currentPlatform === 'admin'"
             [class.platform-business]="currentPlatform === 'business'"
             [class.platform-worker]="currentPlatform === 'worker'">
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet
  ]
})
export class AppComponent implements OnInit {
  currentPlatform: 'admin' | 'business' | 'worker' | null = null;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to user changes to update platform theme
    this.authService.currentUser
      .pipe(
        filter(user => !!user),
        map(user => {
          switch (user?.role?.toLowerCase()) {
            case 'admin':
              return 'admin';
            case 'business_owner':
              return 'business';
            case 'worker':
              return 'worker';
            default:
              return null;
          }
        })
      )
      .subscribe(platform => {
        if (platform) {
          this.currentPlatform = platform;
          this.themeService.applyPlatformTheme(platform);
        }
      });
  }
}
