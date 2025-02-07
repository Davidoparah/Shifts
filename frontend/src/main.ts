import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerIcons } from './app/icons';

// Register Ionicons
registerIcons();

// Bootstrap the application first
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Then import and initialize PWA elements
    import('@ionic/pwa-elements/loader').then(({ defineCustomElements }) => {
      defineCustomElements(window);
    });
  })
  .catch(err => console.error(err));
