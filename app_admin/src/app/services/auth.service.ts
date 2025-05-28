import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log('Sending login request to:', `${this.apiUrl}/login`);
    console.log('With credentials:', { email });
    
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('travlr-token', response.token);
        }
      }),
      catchError(error => {
        console.error('Login error details:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('travlr-token');
  }

  getToken(): string | null {
    return localStorage.getItem('travlr-token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token; // Return true if token exists
  }
}
