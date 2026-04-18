import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSelectorComponent } from './theme-selector.component';
import { ThemeService, Theme } from '../../services/theme-service/theme.service';
import { TranslateModule } from '@ngx-translate/core';

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
      imports: [ThemeSelectorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ThemeService', () => {
    expect(TestBed.inject(ThemeService)).toBeTruthy();
  });

  it('should return currentTheme from ThemeService', () => {
    expect(component.currentTheme).toBe('starters');
  });

  it('should call setTheme when select changes to plain-dark', () => {
    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selectEl.value = 'plain-dark';
    selectEl.dispatchEvent(new Event('change'));
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('plain-dark');
  });

  it('should call setTheme when select changes to plain-light', () => {
    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selectEl.value = 'plain-light';
    selectEl.dispatchEvent(new Event('change'));
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('plain-light');
  });

  it('should call setTheme when select changes to starters', () => {
    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selectEl.value = 'starters';
    selectEl.dispatchEvent(new Event('change'));
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('starters');
  });
});
