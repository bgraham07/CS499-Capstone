import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripDataService } from '../services/trip-data.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-listing.component.html',
  styleUrls: ['./trip-listing.component.css']
})
export class TripListingComponent implements OnInit {
  // Holds the list of trips retrieved from the backend
  trips: any[] = [];

  // Holds the new trip form data before submission
  newTrip = { 
    name: '', 
    length: '', 
    resort: '', 
    perPerson: '',
    startDate: this.formatDateForInput(new Date()) // Initialize with today's date
  };

  // Tracks the ID of the trip currently being edited
  editingTripId: string | null = null;

  // Holds the data for the trip currently being edited
  editedTrip: any = { name: '', length: '', resort: '', perPerson: '' };

  filters: any = {
    destination: '',
    priceMin: null,
    priceMax: null,
    sortBy: 'perPerson',
    sortDirection: 'asc'
  };

  // Inject the TripDataService for communicating with the backend
  constructor(
    private tripService: TripDataService, 
    private authService: AuthService,
    private router: Router
  ) {}

  // Lifecycle hook that runs after component is initialized
  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadTrips();
  }

  // Fetch trips from the backend with optional filters
  loadTrips(): void {
    console.log('Applying filters:', this.filters);
    this.tripService.getTrips(this.filters).subscribe(
      (data) => {
        console.log('Trips received:', data);
        this.trips = data;
        
        // If no trips were found, log a message
        if (this.trips.length === 0) {
          console.log('No trips found. Consider adding some trips or checking the database.');
        }
      },
      (error) => {
        console.error('Error loading trips:', error);
        if (error.status === 401) {
          console.error('Authentication error. Redirecting to login...');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    );
  }

  // Format a date for the date input field (YYYY-MM-DD)
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Generate a random description for a trip
  generateRandomDescription(resort: string): string {
    const templates = [
      `Experience the beauty of ${resort} on this unforgettable journey.`,
      `Discover paradise at ${resort} with our exclusive vacation package.`,
      `Escape to the stunning ${resort} for a perfect getaway.`,
      `Relax and unwind at the magnificent ${resort}.`,
      `Adventure awaits at ${resort} with activities for everyone.`,
      `Immerse yourself in luxury at the world-class ${resort}.`,
      `Create lasting memories at the breathtaking ${resort}.`,
      `Enjoy sun, sand, and relaxation at the beautiful ${resort}.`,
      `Explore the wonders of ${resort} on this exciting trip.`,
      `Indulge in the ultimate vacation experience at ${resort}.`
    ];
    
    // Select a random template from the array
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  // Add a new trip to the backend and update UI
  addTrip(): void {
    console.log('Add trip button clicked');
    
    // Validate all fields are filled
    if (!this.newTrip.name || !this.newTrip.length || !this.newTrip.resort || !this.newTrip.perPerson) {
      alert('All fields are required!');
      return;
    }

    // Use the selected start date or default to a future date
    let startDate: Date;
    if (this.newTrip.startDate) {
      startDate = new Date(this.newTrip.startDate);
    } else {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() + 1);
    }

    // Create a future date for the general date field (if needed)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    // Parse the perPerson value to a number
    let price = 0;
    try {
      // Remove any non-numeric characters except decimal point
      const priceString = this.newTrip.perPerson.replace(/[^0-9.]/g, '');
      price = parseFloat(priceString);
      if (isNaN(price)) {
        price = 0;
      }
    } catch (e) {
      console.error('Error parsing price:', e);
      price = 0;
    }

    // Generate a random description
    const description = this.generateRandomDescription(this.newTrip.resort);

    // Format the trip data to match the backend schema
    const tripData = {
      code: Math.random().toString(36).substr(2, 5).toUpperCase(), // Generate random trip code
      name: this.newTrip.name,
      length: this.newTrip.length,
      start: startDate.toISOString(), // Use the selected start date
      resort: this.newTrip.resort,
      location: this.newTrip.resort, // Set location same as resort
      perPerson: this.newTrip.perPerson,
      price: price, // Use the parsed price
      image: 'default.jpg',
      description: description, // Use the randomly generated description
      date: futureDate.toISOString() // Required field
    };

    console.log('Adding new trip:', tripData);

    // Send the new trip to the backend and update the local list
    this.tripService.addTrip(tripData).subscribe({
      next: (addedTrip) => {
        console.log('Trip added successfully:', addedTrip);
        // Reset filters to ensure all trips are shown
        this.filters = {
          destination: '',
          priceMin: null,
          priceMax: null,
          sortBy: 'perPerson',
          sortDirection: 'asc'
        };
        this.loadTrips(); // Refresh the trip list
        // Reset form with a new default date
        this.newTrip = { 
          name: '', 
          length: '', 
          resort: '', 
          perPerson: '',
          startDate: this.formatDateForInput(new Date())
        };
      },
      error: (error) => {
        console.error('Error adding trip:', error);
        if (error.error && error.error.message) {
          alert(`Failed to add trip: ${error.error.message}`);
        } else {
          alert('Failed to add trip. Please try again.');
        }
      }
    });
  }

  // Delete a trip from the backend and remove it from the list
  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      console.log('Deleting trip with ID:', id);
      this.tripService.deleteTrip(id).subscribe(
        () => {
          console.log('Trip deleted successfully');
          this.trips = this.trips.filter(trip => trip._id !== id);
        },
        (error) => {
          console.error('Error deleting trip:', error);
          alert('Failed to delete trip. Please try again.');
        }
      );
    }
  }

  // Start editing a specific trip
  startEdit(trip: any): void {
    console.log('Starting edit for trip:', trip);
    this.editingTripId = trip._id;
    
    // Create a copy of the trip for editing
    this.editedTrip = { ...trip };
    
    // Format the start date for the date input if it exists
    if (this.editedTrip.start) {
      // If it's a string, convert to Date first
      if (typeof this.editedTrip.start === 'string') {
        const startDate = new Date(this.editedTrip.start);
        this.editedTrip.start = this.formatDateForInput(startDate);
      } else if (this.editedTrip.start instanceof Date) {
        this.editedTrip.start = this.formatDateForInput(this.editedTrip.start);
      }
    }
  }

  // Save changes made to a trip and update the list
  saveEdit(): void {
    if (!this.editingTripId) {
      console.error('No trip ID for editing');
      return;
    }

    console.log('Saving edits for trip ID:', this.editingTripId);
    console.log('Edited trip data:', this.editedTrip);

    this.tripService.updateTrip(this.editingTripId, this.editedTrip).subscribe(
      (updatedTrip) => {
        console.log('Trip updated successfully:', updatedTrip);
        const index = this.trips.findIndex(trip => trip._id === updatedTrip._id);
        if (index !== -1) {
          this.trips[index] = updatedTrip;
        }
        this.cancelEdit(); // Reset editing state
      },
      (error) => {
        console.error('Error updating trip:', error);
        alert('Failed to update trip. Please try again.');
      }
    );
  }

  // Cancel editing and reset the edit form
  cancelEdit(): void {
    this.editingTripId = null;
    this.editedTrip = { 
      name: '', 
      length: '', 
      resort: '', 
      perPerson: '',
      start: this.formatDateForInput(new Date())
    };
  }
}
