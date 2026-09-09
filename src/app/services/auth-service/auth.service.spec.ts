import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const base = `${environment.apiBaseUrl}/v1`;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts signed out', () => {
    expect(service.isSignedIn).toBeFalse();
  });

  // The session cookie is HttpOnly by design, so every call has to carry
  // credentials explicitly or the browser sends nothing.
  it('sends credentials with every request', () => {
    service.refresh().subscribe();
    const request = http.expectOne(`${base}/auth/me`);

    expect(request.request.withCredentials)
      .withContext('without this the HttpOnly session cookie is never sent')
      .toBeTrue();

    request.flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('remembers who signed in', () => {
    service.login('ash@pallet.town', 'pikachu-i-choose-you').subscribe();
    http.expectOne(`${base}/auth/login`).flush({ id: 'abc', email: 'ash@pallet.town' });

    expect(service.currentUser?.email).toBe('ash@pallet.town');
  });

  it('forgets on sign out', () => {
    service.login('ash@pallet.town', 'pikachu-i-choose-you').subscribe();
    http.expectOne(`${base}/auth/login`).flush({ id: 'abc', email: 'ash@pallet.town' });

    service.logout().subscribe();
    http.expectOne(`${base}/auth/logout`).flush(null);

    expect(service.isSignedIn).toBeFalse();
  });

  // A player with no account must never be shown an error for a question they
  // did not ask. Any failure simply means signed out.
  it('treats an unreachable API as signed out, not as an error', () => {
    let errored = false;
    let result: unknown = 'unset';

    service.refresh().subscribe({
      next: user => (result = user),
      error: () => (errored = true),
    });

    http.expectOne(`${base}/auth/me`).error(new ProgressEvent('network error'));

    expect(errored).withContext('the game must keep working with the API down').toBeFalse();
    expect(result).toBeNull();
    expect(service.isSignedIn).toBeFalse();
  });

  it('reports the check as done even when it failed', () => {
    let checked = false;
    service.checked$.subscribe(value => (checked = value));

    service.refresh().subscribe();
    http.expectOne(`${base}/auth/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(checked).toBeTrue();
  });

  describe('error messages', () => {
    // Signup and login answer "wrong password" and "no such account"
    // identically on purpose. Rewording here would undo that on the client.
    it('shows exactly what the server said', () => {
      const response = new HttpErrorResponse({
        status: 401,
        error: { error: { code: 'unauthorized', message: 'That email and password do not match an account.' } },
      });

      expect(AuthService.messageFor(response, 'fallback'))
        .toBe('That email and password do not match an account.');
    });

    it('falls back when there is no message to show', () => {
      expect(AuthService.messageFor(new HttpErrorResponse({ status: 0 }), 'fallback')).toBe('fallback');
      expect(AuthService.messageFor(new Error('boom'), 'fallback')).toBe('fallback');
    });
  });
});
