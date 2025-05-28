// Marks this class as injectable and available throughout the app
import { Injectable } from '@angular/core';
// Used to make HTTP requests to the backend API
import { HttpClient, HttpParams } from '@angular/common/http';
// Provides support for asynchronous stream handling
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Configure the service as a singleton accessible throughout the app
@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  // Base URL for trip-related API endpoints
  private apiUrl = 'http://localhost:3000/api/trips';

  // Inject HttpClient to perform HTTP operations
  constructor(private http: HttpClient) {}

  // Get all trips from the API with optional filters
  getTrips(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    
    // Add filters to params if they exist
    if (filters) {
      if (filters.destination) {
        params = params.set('destination', filters.destination);
      }
      if (filters.priceMin) {
        params = params.set('priceMin', filters.priceMin);
      }
      if (filters.priceMax) {
        params = params.set('priceMax', filters.priceMax);
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.sortDirection) {
        params = params.set('sortDirection', filters.sortDirection);
      }
    }
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      tap(trips => console.log('Fetched trips:', trips.length)),
      catchError(error => {
        console.error('Error fetching trips:', error);
        return throwError(error);
      })
    );
  }

  // Add a new trip to the backend database
  addTrip(trip: any): Observable<any> {
    console.log('Sending trip data to API:', trip);
    
    return this.http.post<any>(this.apiUrl, trip).pipe(
      tap(response => console.log('API response:', response)),
      catchError(error => {
        console.error('API error:', error);
        return throwError(error);
      })
    );
  }

  // Update an existing trip using its ID
  updateTrip(id: string, trip: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trip).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(error);
      })
    );
  }

  // Delete a trip by its ID
  deleteTrip(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('API error:', error);
        return throwError(error);
      })
    );
  }
}
