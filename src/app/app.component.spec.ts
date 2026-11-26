import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('daily-journal-theme');
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem('daily-journal-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should toggle and persist the selected theme', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    expect(app.isDarkTheme).toBeFalse();
    app.toggleTheme();

    expect(app.isDarkTheme).toBeTrue();
    expect(localStorage.getItem('daily-journal-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should restore the saved theme on startup', () => {
    localStorage.setItem('daily-journal-theme', 'dark');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDarkTheme).toBeTrue();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
