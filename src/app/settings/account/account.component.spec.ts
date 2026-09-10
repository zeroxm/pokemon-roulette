import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AccountComponent } from './account.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { SyncService } from '../../services/sync-service/sync.service';
import { SyncStateService } from '../../services/sync-state-service/sync-state.service';
import { environment } from '../../../environments/environment';

describe('AccountComponent', () => {
  let fixture: ComponentFixture<AccountComponent>;
  let component: AccountComponent;
  let http: HttpTestingController;
  let wipe: jasmine.Spy;

  const base = `${environment.apiBaseUrl}/v1`;

  /**
   * The "who am I" the app asks on startup; answered signed-out by default.
   *
   * Asked by the app root rather than by this component, so the spec plays the
   * root's part.
   */
  const answerWhoAmI = (user: unknown = null) => {
    TestBed.inject(AuthService).refresh().subscribe();
    const request = http.expectOne(`${base}/auth/me`);
    if (user) {
      request.flush(user);
    } else {
      request.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);

    // Signing out and deleting both wipe this device and reload the page,
    // which would take the test runner with them.
    wipe = spyOn(TestBed.inject(SyncService), 'clearLocalDataAndReload');

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    answerWhoAmI();
    expect(component).toBeTruthy();
  });

  it('shows the signed-out state when there is no session', () => {
    answerWhoAmI();

    expect(component.user).toBeNull();
    expect(component.checked).toBeTrue();
  });

  describe('validation, which mirrors the backend', () => {
    beforeEach(() => answerWhoAmI());

    it('rejects a malformed email', () => {
      component.email = 'not-an-email';
      expect(component.emailValid).toBeFalse();

      component.email = 'ash@pallet.town';
      expect(component.emailValid).toBeTrue();
    });

    it('requires twelve characters, as the server does', () => {
      component.password = 'short';
      expect(component.passwordValid).toBeFalse();

      component.password = 'a'.repeat(12);
      expect(component.passwordValid).toBeTrue();
    });

    it('does not submit an invalid form', () => {
      component.email = 'nope';
      component.password = 'short';

      component.submit();

      http.expectNone(`${base}/auth/login`);
      expect(component.touched).withContext('and it should say why').toBeTrue();
    });
  });

  it('signs in', () => {
    answerWhoAmI();

    component.email = 'ash@pallet.town';
    component.password = 'pikachu-i-choose-you';
    component.submit();

    http.expectOne(`${base}/auth/login`).flush({ id: 'abc', email: 'ash@pallet.town' });
    fixture.detectChanges();

    expect(component.user?.email).toBe('ash@pallet.town');
    expect(component.password).withContext('the password must not linger in memory').toBe('');
  });

  it('creates an account when in signup mode', () => {
    answerWhoAmI();

    component.setMode('signup');
    component.email = 'new@pallet.town';
    component.password = 'a-long-enough-password';
    component.submit();

    http.expectOne(`${base}/auth/signup`).flush({ id: 'abc', email: 'new@pallet.town' });
  });

  // Rewording here would undo the server's deliberate refusal to say which of
  // the two things was wrong.
  it('shows the server\'s own message on failure', () => {
    answerWhoAmI();

    component.email = 'ash@pallet.town';
    component.password = 'pikachu-i-choose-you';
    component.submit();

    http.expectOne(`${base}/auth/login`).flush(
      { error: { code: 'unauthorized', message: 'That email and password do not match an account.' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    expect(component.error).toBe('That email and password do not match an account.');
    expect(component.busy).toBeFalse();
  });

  it('needs a password before it will delete anything', () => {
    answerWhoAmI({ id: 'abc', email: 'ash@pallet.town' });

    component.confirmingDelete = true;
    component.deletePassword = '';
    component.deleteAccount();

    http.expectNone(`${base}/account`);
  });

  it('deletes the account when confirmed', () => {
    answerWhoAmI({ id: 'abc', email: 'ash@pallet.town' });

    component.confirmingDelete = true;
    component.deletePassword = 'pikachu-i-choose-you';
    component.deleteAccount();

    const request = http.expectOne(`${base}/account`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    fixture.detectChanges();

    expect(component.user).toBeNull();
    expect(component.confirmingDelete).toBeFalse();
    expect(wipe).toHaveBeenCalled();
  });

  describe('signing out', () => {

    it('asks first when progress has not reached the account', () => {
      // Signing out clears this device, so unsynced progress dies with it.
      answerWhoAmI({ id: 'abc', email: 'ash@pallet.town' });
      TestBed.inject(SyncStateService).markDirty();

      component.signOut();

      http.expectNone(`${base}/auth/logout`);
      expect(component.confirmingSignOut).toBeTrue();

      component.signOut();
      http.expectOne(`${base}/auth/logout`).flush(null);
      expect(wipe).toHaveBeenCalled();
    });

    it('does not ask when everything is saved', () => {
      answerWhoAmI({ id: 'abc', email: 'ash@pallet.town' });
      TestBed.inject(SyncStateService).markSynced();

      component.signOut();

      expect(component.confirmingSignOut).toBeFalse();
      http.expectOne(`${base}/auth/logout`).flush(null);
      expect(wipe).toHaveBeenCalled();
    });
  });
});
