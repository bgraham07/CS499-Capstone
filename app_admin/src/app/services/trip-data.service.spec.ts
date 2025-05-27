// Import TestBed utility for setting up Angular test environment
import { TestBed } from '@angular/core/testing';

// Import the service to be tested
import { TripDataService } from './trip-data.service';

// Define a test suite for TripDataService
describe('TripDataService', () => {
  // Declare a variable to hold the service instance
  let service: TripDataService;

  // Setup logic to run before each test
  beforeEach(() => {
    // Configure the testing module without additional providers for this case
    TestBed.configureTestingModule({});

    // Inject the TripDataService so it can be tested
    service = TestBed.inject(TripDataService);
  });

  // Basic test to confirm the service is created
  it('should be created', () => {
    // Assert that the service instance is truthy (i.e., it exists)
    expect(service).toBeTruthy();
  });
});
