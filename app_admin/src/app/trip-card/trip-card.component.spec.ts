import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the component we are going to test
import { TripCardComponent } from './trip-card.component';

// Define the test suite for TripCardComponent
describe('TripCardComponent', () => {
  // Declare the component instance and fixture to manage test environment
  let component: TripCardComponent;
  let fixture: ComponentFixture<TripCardComponent>;

  // Run setup logic before each test
  beforeEach(async () => {
    // Configure the testing module with the component to be tested
    await TestBed.configureTestingModule({
      imports: [TripCardComponent]
    })
    .compileComponents(); // Compile template and CSS

    // Create the component fixture and get an instance of the component
    fixture = TestBed.createComponent(TripCardComponent);
    component = fixture.componentInstance;

    // Trigger Angular's change detection to update the DOM
    fixture.detectChanges();
  });

  // Basic test to check that the component instance is created
  it('should create', () => {
    expect(component).toBeTruthy(); // Expect the component to exist
  });
});
