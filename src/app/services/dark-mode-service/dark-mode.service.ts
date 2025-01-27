import { Inject, Injectable, Optional, Renderer2, RendererFactory2 } from '@angular/core';
import { DarkModeOptions } from './types';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { MediaQueryService } from './media-query.service';
import { DARK_MODE_OPTIONS } from './dark-mode-options';
import { defaultOptions } from './default-options';
import { isNil } from './isNil';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly options: DarkModeOptions;
  private readonly renderer: Renderer2;
  private readonly darkModeSubject$: BehaviorSubject<boolean>;

  constructor(
    private rendererFactory: RendererFactory2,
    private mediaQueryService: MediaQueryService,

    @Optional() @Inject(DARK_MODE_OPTIONS) private providedOptions: DarkModeOptions | null) {
    this.options = { ...defaultOptions, ...(this.providedOptions || {}) };
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.darkModeSubject$ = new BehaviorSubject(this.getInitialDarkModeValue());
    this.darkModeSubject$.getValue() ? this.enable() : this.disable();
    this.removePreloadingClass();
  }

  /**
   * An Observable representing current dark mode.
   * Only fires the initial and distinct values.
   */
  get darkMode$(): Observable<boolean> {
    return this.darkModeSubject$.asObservable().pipe(distinctUntilChanged());
  }

  toggle(): void {
    this.darkModeSubject$.getValue() ? this.disable() : this.enable();
  }

  enable(): void {
    const { element, darkModeClass, lightModeClass } = this.options;
    this.renderer.removeClass(element, lightModeClass);
    this.renderer.addClass(element, darkModeClass);
    this.saveDarkModeToStorage(true);
    this.darkModeSubject$.next(true);
  }

  disable(): void {
    const { element, darkModeClass, lightModeClass } = this.options;
    this.renderer.removeClass(element, darkModeClass);
    this.renderer.addClass(element, lightModeClass);
    this.saveDarkModeToStorage(false);
    this.darkModeSubject$.next(false);
  }

  private getInitialDarkModeValue(): boolean {
    const darkModeFromStorage = this.getDarkModeFromStorage();

    if (isNil(darkModeFromStorage)) {
      return this.mediaQueryService.prefersDarkMode();
    }

    return darkModeFromStorage;
  }

  private saveDarkModeToStorage(darkMode: boolean): void {
    localStorage.setItem(this.options.storageKey, JSON.stringify({ darkMode }));
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
