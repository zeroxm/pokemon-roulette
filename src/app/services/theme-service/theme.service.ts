import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export type Theme = 'starters' | 'plain-dark' | 'plain-light';

const STORAGE_KEY = 'pokemon-roulette-theme';
const DEFAULT_THEME: Theme = 'starters';

const ALL_THEME_CLASSES: string[] = [
  'theme-starters',
  'theme-plain-dark',
  'theme-plain-light',
  // Legacy classes left by DarkModeService — remove them too
  'dark-mode',
  'light-mode',
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly renderer: Renderer2;
  private readonly _theme$: BehaviorSubject<Theme>;

  /** Observable that emits the current theme. Only fires on distinct changes. */
  readonly theme$: Observable<Theme>;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme =
      stored === 'starters' || stored === 'plain-dark' || stored === 'plain-light'
        ? stored
        : DEFAULT_THEME;

    this._theme$ = new BehaviorSubject<Theme>(initial);
    this.theme$ = this._theme$.asObservable().pipe(distinctUntilChanged());

    // Apply immediately — also handles THEME-05 migration (writes default to storage)
    this.setTheme(initial);
  }

  /** Synchronous read of the current theme value. */
  get currentTheme(): Theme {
    return this._theme$.value;
  }

  /**
   * Apply a theme:
   * 1. Removes ALL old theme + legacy dark-mode/light-mode classes from body
   * 2. Adds `theme-${theme}` to body
   * 3. Persists selection to localStorage
   * 4. Emits new value on theme$
   */
  setTheme(theme: Theme): void {
    const body = document.body;

    // Remove all known theme classes (including legacy ones from DarkModeService)
    ALL_THEME_CLASSES.forEach(cls => this.renderer.removeClass(body, cls));

    // Apply the selected theme class
    this.renderer.addClass(body, `theme-${theme}`);

    // Persist
    localStorage.setItem(STORAGE_KEY, theme);

    // Emit (BehaviorSubject + distinctUntilChanged handles dedup)
    this._theme$.next(theme);
  }
}
