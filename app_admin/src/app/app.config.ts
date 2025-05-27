// Import necessary types and providers for Angular app setup
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Import the app's route configuration and components
import { routes } from './app.routes';
import { TripListingComponent } from './trip-listing/trip-listing.component';

// Define the configuration object for the Angular application
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimize Angular change detection by reducing duplicate DOM events
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Register the app's routes for navigation
    provideRouter(routes),

    // Enable HTTP client capabilities across the app
    provideHttpClient(),

    // Register the TripListingComponent so it can be used in standalone context
    TripListingComponent
  ]
};