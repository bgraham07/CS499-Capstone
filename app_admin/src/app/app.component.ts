import { Component } from '@angular/core';
import { TripListingComponent } from './trip-listing/trip-listing.component';

// Decorator to define an Angular component
@Component({
  // Custom tag to use this component in HTML
  selector: 'app-root',
  // This is a standalone component not declared in a module
  standalone: true,
  // Import other components or modules needed by this component
  imports: [TripListingComponent],
  // Path to the component's HTML template
  templateUrl: './app.component.html',
  // Path to the component's styles
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Placeholder method currently not implemented
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}