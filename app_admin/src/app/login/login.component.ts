import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Admin Login</h2>
      <div class="login-form">
        <label>Email:</label>
        <input [(ngModel)]="email" type="email">
        
        <label>Password:</label>
        <input [(ngModel)]="password" type="password">
        
        <button (click)="login()" [disabled]="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 350px;
      margin: 40px 0 40px 40px; /* Changed from "40px auto" to "40px 0 40px 40px" */
      background: #f8f8f8;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .login-form label {
      font-weight: bold;
      display: block;
      margin-top: 10px;
    }
    
    .login-form input {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }
    
    .login-form button {
      display: block;
      width: 100%;
      padding: 10px;
      margin-top: 15px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 5px;
      background-color: #4a90e2;
      color: white;
      border: none;
    }
    
    .login-form button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .error-message {
      color: red;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, redirect to trips page
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/trips']);
    }
  }
  
  login() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.email, this.password).subscribe(
      () => {
        this.isLoading = false;
        this.router.navigate(['/trips']);
      },
      (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    );
  }
}
