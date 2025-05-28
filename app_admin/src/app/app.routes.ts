import { Routes } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'trips', component: TripListingComponent, canActivate: [authGuard] }
];
