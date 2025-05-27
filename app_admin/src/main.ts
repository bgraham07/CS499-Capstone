// Import the bootstrapApplication function to initialize the Angular app
import { bootstrapApplication } from '@angular/platform-browser';
// Import the app's root configuration object
import { appConfig } from './app/app.config';
// Import the root component of the application
import { AppComponent } from './app/app.component';

// Bootstrap the application using the root component and configuration
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)); // Log errors if bootstrapping fails
