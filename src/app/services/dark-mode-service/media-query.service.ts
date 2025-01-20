import { Injectable } from '@angular/core';
import { prefersDarkSchemeQuery } from './media-query';

@Injectable({ providedIn: 'root' })
export class MediaQueryService {
  matchMedia(query: string): MediaQueryList {
    return window.matchMedia(query);
  }

  prefersDarkMode(): boolean {
    return this.matchMedia(prefersDarkSchemeQuery).matches;
  }
}