import { Inject, Injectable, Optional, Renderer2, RendererFactory2 } from '@angular/core';
import { DarkModeOptions } from './types';
import { BehaviorSubject, distinctUntilChanged, Observable, map } from 'rxjs';
import { MediaQueryService } from './media-query.service';
import { DARK_MODE_OPTIONS } from './dark-mode-options';
import { defaultOptions } from './default-options';
import { isNil } from './isNil';

export type ThemeMode = 'light' | 'dark' | 'snowflake';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly options: DarkModeOptions;
  private readonly renderer: Renderer2;
  private readonly darkModeSubject$: BehaviorSubject<boolean>;
  private readonly themeSubject$: BehaviorSubject<ThemeMode>;

  private readonly themeClasses: Record<ThemeMode, string> = {
    light: 'light-mode',
    dark: 'dark-mode',
    snowflake: 'snowflake-mode',
  };

  constructor(
    private rendererFactory: RendererFactory2,
    private mediaQueryService: MediaQueryService,

    @Optional() @Inject(DARK_MODE_OPTIONS) private providedOptions: DarkModeOptions | null) {
    this.options = { ...defaultOptions, ...(this.providedOptions || {}) };
    this.renderer = this.rendererFactory.createRenderer(null, null);

    const initialTheme = this.getInitialTheme();
    this.themeSubject$ = new BehaviorSubject<ThemeMode>(initialTheme);
    this.darkModeSubject$ = new BehaviorSubject(initialTheme === 'dark');

    this.applyTheme(initialTheme);
    this.removePreloadingClass();
  }

  get darkMode$(): Observable<boolean> {
    return this.darkModeSubject$.asObservable().pipe(distinctUntilChanged());
  }

  get theme$(): Observable<ThemeMode> {
    return this.themeSubject$.asObservable().pipe(distinctUntilChanged());
  }

  toggle(): void {
    this.darkModeSubject$.getValue() ? this.setTheme('light') : this.setTheme('dark');
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
    this.saveThemeToStorage(theme);
    this.themeSubject$.next(theme);
    this.darkModeSubject$.next(theme === 'dark');
  }

  enable(): void {
    this.setTheme('dark');
  }

  disable(): void {
    this.setTheme('light');
  }

  private applyTheme(theme: ThemeMode): void {
    const { element } = this.options;
    for (const cls of Object.values(this.themeClasses)) {
      this.renderer.removeClass(element, cls);
    }
    this.renderer.addClass(element, this.themeClasses[theme]);
  }

  private getInitialTheme(): ThemeMode {
    const themeFromStorage = this.getThemeFromStorage();
    if (themeFromStorage) {
      return themeFromStorage;
    }

    const darkModeFromStorage = this.getDarkModeFromStorage();
    if (!isNil(darkModeFromStorage)) {
      return darkModeFromStorage ? 'dark' : 'light';
    }

    return this.mediaQueryService.prefersDarkMode() ? 'dark' : 'light';
  }

  private saveThemeToStorage(theme: ThemeMode): void {
    localStorage.setItem(this.options.storageKey, JSON.stringify({ darkMode: theme === 'dark', theme }));
  }

  private getThemeFromStorage(): ThemeMode | null {
    const storageItem = localStorage.getItem(this.options.storageKey);
    if (storageItem) {
      try {
        const parsed = JSON.parse(storageItem);
        if (parsed?.theme && ['light', 'dark', 'snowflake'].includes(parsed.theme)) {
          return parsed.theme as ThemeMode;
        }
      } catch (error) {
        // Fall through to return null
      }
    }
    return null;
  }

  private getDarkModeFromStorage(): boolean | null {
    const storageItem = localStorage.getItem(this.options.storageKey);

    if (storageItem) {
      try {
        return JSON.parse(storageItem)?.darkMode;
      } catch (error) {
        console.error(
          'Invalid darkMode localStorage item:',
          storageItem,
          'falling back to color scheme media query'
        );
      }
    }

    return null;
  }

  private removePreloadingClass(): void {
    setTimeout(() => {
      this.renderer.removeClass(
        this.options.element,
        this.options.preloadingClass
      );
    });
  }
}
