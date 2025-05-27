// Marks this class as injectable and available throughout the app
import { Injectable } from '@angular/core';
// Used to make HTTP requests to the backend API
import { HttpClient } from '@angular/common/http';
// Provides support for asynchronous stream handling
import { Observable } from 'rxjs';

// Configure the service as a singleton accessible throughout the app
@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  // Base URL for trip-related API endpoints
  private apiUrl = 'http://localhost:3000/api/trips';

  // Inject HttpClient to perform HTTP operations
  constructor(private http: HttpClient) {}

  // Retrieve a list of all trips from the backend
  getTrips(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Add a new trip to the backend database
  addTrip(trip: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, trip);
  }

  // Update an existing trip using its ID
  updateTrip(id: string, trip: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trip);
  }

  // Delete a trip by its ID
  deleteTrip(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}