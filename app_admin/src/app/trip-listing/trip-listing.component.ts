import { Component, OnInit } from '@angular/core';
import { TripDataService } from '../services/trip-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-listing',
  templateUrl: './trip-listing.component.html',
  styleUrls: ['./trip-listing.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TripListingComponent implements OnInit {
  // Holds the list of trips retrieved from the backend
  trips: any[] = [];

  // Holds the new trip form data before submission
  newTrip = { name: '', length: '', resort: '', perPerson: '' };

  // Tracks the ID of the trip currently being edited
  editingTripId: string | null = null;

  // Holds the data for the trip currently being edited
  editedTrip: any = { name: '', length: '', resort: '', perPerson: '' };

  // Inject the TripDataService for communicating with the backend
  constructor(private tripService: TripDataService) {}

  // Lifecycle hook that runs after component is initialized
  ngOnInit(): void {
    this.loadTrips(); // Load trips on component mount
  }

  // Fetch trips from the backend and update the trips list
  loadTrips(): void {
    this.tripService.getTrips().subscribe((data) => {
      this.trips = data;
    });
  }

  // Add a new trip to the backend and update UI
  addTrip(): void {
    // Validate all fields are filled
    if (!this.newTrip.name || !this.newTrip.length || !this.newTrip.resort || !this.newTrip.perPerson) {
      alert('All fields are required!');
      return;
    }

    // Format the trip data to match the backend schema
    const tripData = {
      code: Math.random().toString(36).substr(2, 5).toUpperCase(), // Generate random trip code
      name: this.newTrip.name,
      length: Number(this.newTrip.length),
      start: new Date().toISOString(), // Auto-set the start date
      resort: this.newTrip.resort,
      perPerson: Number(this.newTrip.perPerson),
      image: 'default.jpg',
      description: 'New trip added'
    };

    // Send the new trip to the backend and update the local list
    this.tripService.addTrip(tripData).subscribe((addedTrip) => {
      this.trips.push(addedTrip); // Add to the list visually
      this.newTrip = { name: '', length: '', resort: '', perPerson: '' }; // Reset form
    });
  }

  // Delete a trip from the backend and remove it from the list
  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe(() => {
        this.trips = this.trips.filter(trip => trip._id !== id);
      });
    }
  }

  // Start editing a specific trip
  startEdit(trip: any): void {
    this.editingTripId = trip._id;
    this.editedTrip = { ...trip };
  }

  // Save changes made to a trip and update the list
  saveEdit(): void {
    if (!this.editingTripId) return;

    this.tripService.updateTrip(this.editingTripId, this.editedTrip).subscribe((updatedTrip) => {
      const index = this.trips.findIndex(trip => trip._id === updatedTrip._id);
      if (index !== -1) {
        this.trips[index] = updatedTrip;
      }
      this.cancelEdit(); // Reset editing state
    });
  }

  // Cancel editing and reset the edit form
  cancelEdit(): void {
    this.editingTripId = null;
    this.editedTrip = { name: '', length: '', resort: '', perPerson: '' };
  }
}