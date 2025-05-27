import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

// Define the test suite for the root AppComponent
describe('AppComponent', () => {
  // Before each test, configure the test module with the AppComponent
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents(); // Compile component HTML and CSS
  });

  // Test to ensure the AppComponent is created successfully
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // Assert that the component instance exists
  });

  // Test to confirm that the app title matches the expected string
  it(`should have the 'app_admin' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('app_admin'); // Validate component's title property
  });

  // Test to verify that the rendered HTML includes the expected title text
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Trigger change detection and rendering
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, app_admin'); // Check if h1 contains expected text
  });
});
