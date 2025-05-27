import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the component to be tested
import { TripListingComponent } from './trip-listing.component';

// Define a test suite for the TripListingComponent
describe('TripListingComponent', () => {
  // Declare variables for the component instance and its test fixture
  let component: TripListingComponent;
  let fixture: ComponentFixture<TripListingComponent>;

  // Setup logic that runs before each test in this suite
  beforeEach(async () => {
    // Configure the testing module and import the component under test
    await TestBed.configureTestingModule({
      imports: [TripListingComponent]
    })
    .compileComponents(); // Compile the component’s HTML and CSS

    // Create the component and assign it to the fixture and component variables
    fixture = TestBed.createComponent(TripListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding and rendering
  });

  // Test case to verify that the component instance is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Confirm the component instance exists
  });
});
