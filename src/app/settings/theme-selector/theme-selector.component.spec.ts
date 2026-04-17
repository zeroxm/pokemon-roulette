import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSelectorComponent } from './theme-selector.component';
import { ThemeService, Theme } from '../../services/theme-service/theme.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Minimal mock for TranslatePipe — returns the key unchanged
class MockTranslatePipe {
  transform(key: string): string { return key; }
}

describe('ThemeSelectorComponent', () => {
  let component: ThemeSelectorComponent;
  let fixture: ComponentFixture<ThemeSelectorComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    mockThemeService = jasmine.createSpyObj<ThemeService>(
      'ThemeService',
      ['setTheme'],
      { currentTheme: 'starters' as Theme }
    );

    await TestBed.configureTestingModule({
      imports: [ThemeSelectorComponent, CommonModule, FormsModule],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
      ],
    })
      .overrideComponent(ThemeSelectorComponent, {
        set: {
          imports: [CommonModule, FormsModule],
          providers: [],
        },
      })
      .overridePipe(TranslatePipe, { set: { transform: (key: string) => key } as never })
      .compileComponents();

    fixture = TestBed.createComponent(ThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ThemeService', () => {
    expect(component.themeService).toBeTruthy();
  });

  it('should return currentTheme from ThemeService', () => {
    expect(component.currentTheme).toBe('starters');
  });

  it('should call setTheme when select changes', () => {
    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selectEl.value = 'plain-dark';
    selectEl.dispatchEvent(new Event('change'));
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('plain-dark');
  });

  it('should call setTheme with plain-light on change', () => {
    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selectEl.value = 'plain-light';
    selectEl.dispatchEvent(new Event('change'));
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('plain-light');
  });
});
