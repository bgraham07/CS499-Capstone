import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

// Import the app's route configuration
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

// Define the configuration object for the Angular application
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimize Angular change detection by reducing duplicate DOM events
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Register the app's routes for navigation
    provideRouter(routes),

    // Enable HTTP client capabilities across the app with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
