// Import required decorators and modules from Angular core
import { Component, Input } from '@angular/core';
// Import CommonModule to access common Angular directives in the template
import { CommonModule } from '@angular/common';

@Component({
  // Define the custom HTML tag for this component
  selector: 'app-trip-card',
  // Mark this component as standalone so it doesn't require a module declaration
  standalone: true,
  // Import Angular's common module for use within the template
  imports: [CommonModule],
  // Link to the component's HTML template
  templateUrl: './trip-card.component.html',
  // Link to the component's CSS styles
  styleUrls: ['./trip-card.component.css']
})
export class TripCardComponent {
  // Input property to receive trip data from the parent component
  @Input() trip!: { name: string; location: string; price: number };
}