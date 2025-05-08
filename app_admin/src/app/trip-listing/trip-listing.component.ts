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
  trips: any[] = [];
  newTrip = { name: '', length: '', resort: '', perPerson: '' };
  editingTripId: string | null = null;
  editedTrip: any = { name: '', length: '', resort: '', perPerson: '' };

  constructor(private tripService: TripDataService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripService.getTrips().subscribe((data) => {
      this.trips = data;
    });
  }

  addTrip(): void {
    if (!this.newTrip.name || !this.newTrip.length || !this.newTrip.resort || !this.newTrip.perPerson) {
      alert('All fields are required!');
      return;
    }

    // Create the correct object format
    const tripData = {
      code: Math.random().toString(36).substr(2, 5).toUpperCase(), // Generate random code
      name: this.newTrip.name,
      length: Number(this.newTrip.length),
      start: new Date().toISOString(), // Auto-generate start date
      resort: this.newTrip.resort,
      perPerson: Number(this.newTrip.perPerson),
      image: 'default.jpg',
      description: 'New trip added'
    };

    this.tripService.addTrip(tripData).subscribe((addedTrip) => {
      this.trips.push(addedTrip); // Update UI immediately
      this.newTrip = { name: '', length: '', resort: '', perPerson: '' }; // Clear form
    });
  }

  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe(() => {
        this.trips = this.trips.filter(trip => trip._id !== id);
      });
    }
  }

  startEdit(trip: any): void {
    this.editingTripId = trip._id;
    this.editedTrip = { ...trip };
  }

  saveEdit(): void {
    if (!this.editingTripId) return;

    this.tripService.updateTrip(this.editingTripId, this.editedTrip).subscribe((updatedTrip) => {
      const index = this.trips.findIndex(trip => trip._id === updatedTrip._id);
      if (index !== -1) {
        this.trips[index] = updatedTrip;
      }
      this.cancelEdit();
    });
  }

  cancelEdit(): void {
    this.editingTripId = null;
    this.editedTrip = { name: '', length: '', resort: '', perPerson: '' };
  }
}