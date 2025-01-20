import { InjectionToken } from '@angular/core';
import { DarkModeOptions } from './types';

/**
 * InjectionToken to override default options
 *
 * @example
 *
 * providers: [
 *   {
 *     provide: DARK_MODE_OPTIONS,
 *     useValue: {
 *       darkModeClass: 'my-dark-mode',
 *       lightModeClass: 'my-light-mode',
 *     },
 *   },
 * ]
 */
export const DARK_MODE_OPTIONS = new InjectionToken<Partial<DarkModeOptions>>(
  'DARK_MODE_OPTIONS'
);