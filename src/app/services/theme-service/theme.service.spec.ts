import { TestBed } from '@angular/core/testing';
import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { ThemeService } from './theme.service';

describe('ThemeService — backgroundImage', () => {
  afterEach(() => {
    document.body.style.backgroundImage = '';
    document.body.className = '';
    localStorage.clear();
    // restore base element href
    const base = document.querySelector('base');
    if (base) base.setAttribute('href', '/');
  });

  it('Test A: sets background-image using APP_BASE_HREF DI token when provided', () => {
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: APP_BASE_HREF, useValue: '/pokemon-roulette/' },
      ],
    });
    const svc = TestBed.inject(ThemeService);
    svc.setTheme('starters');
    expect(document.body.style.backgroundImage).toContain('pokemon-roulette/dark-background.png');
  });

  it('Test B: falls back to DOM <base href> when APP_BASE_HREF token is absent', () => {
    let base = document.querySelector('base') as HTMLBaseElement | null;
    if (!base) {
      base = document.createElement('base');
      document.head.appendChild(base);
    }
    base.setAttribute('href', '/pokemon-roulette/');

    TestBed.configureTestingModule({
      providers: [ThemeService],
      // APP_BASE_HREF intentionally NOT provided
    });
    const svc = TestBed.inject(ThemeService);
    svc.setTheme('starters');
    expect(document.body.style.backgroundImage).toContain('pokemon-roulette/dark-background.png');
  });

  it('Test C: removes background-image when switching away from starters', () => {
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: APP_BASE_HREF, useValue: '/pokemon-roulette/' },
      ],
    });
    const svc = TestBed.inject(ThemeService);
    svc.setTheme('starters');
    svc.setTheme('plain-dark');
    expect(document.body.style.backgroundImage).toBe('');
  });
});
