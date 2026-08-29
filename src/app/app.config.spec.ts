import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateLoader } from '@ngx-translate/core';

import { appConfig } from './app.config';

/**
 * The translation loader is wired entirely through DI, so nothing else in the suite
 * touches it — a misconfigured loader resolves to an empty translation set instead of
 * throwing, and every template then renders its raw key with the app otherwise working.
 * That is exactly how the ngx-translate 17 -> 18 config change slipped past all 299
 * other specs. These tests assert the wiring by the request it actually issues.
 */
describe('appConfig translation wiring', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches a locale from ./assets/i18n and resolves its contents', () => {
    let resolved: unknown;
    TestBed.inject(TranslateLoader).getTranslation('en').subscribe(t => (resolved = t));

    const req = http.expectOne(r => r.url === './assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    req.flush({ 'wheel.spin': 'Click to Spin !' });

    expect(resolved).toEqual({ 'wheel.spin': 'Click to Spin !' });
  });

  it('requests the locale it was asked for, not a fixed one', () => {
    TestBed.inject(TranslateLoader).getTranslation('pt').subscribe();

    http.expectOne(r => r.url === './assets/i18n/pt.json').flush({});
  });
});
