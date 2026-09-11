import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { bootstrapController } from '@ng-icons/bootstrap-icons';

import { AccountComponent } from './account.component';
import { AuthService } from '../services/auth-service/auth.service';
import { SyncService } from '../services/sync-service/sync.service';
import { SyncStateService } from '../services/sync-state-service/sync-state.service';
import { environment } from '../../environments/environment';

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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        // The page shell's Main Game button; the app provides icons globally.
        provideIcons({ bootstrapController }),
      ],
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
    component.passwordConfirmation = 'a-long-enough-password';
    component.submit();

    http.expectOne(`${base}/auth/signup`).flush({ id: 'abc', email: 'new@pallet.town' });
  });

  describe('signing up', () => {

    it('will not submit until the password is typed twice and matches', () => {
      // There is no password reset, so a typo in a single field would be an
      // account nobody can ever open.
      answerWhoAmI();

      component.setMode('signup');
      component.email = 'new@pallet.town';
      component.password = 'a-long-enough-password';
      component.passwordConfirmation = 'a-long-enough-passwrod';
      component.submit();

      http.expectNone(`${base}/auth/signup`);
      expect(component.confirmationValid).toBeFalse();

      component.passwordConfirmation = 'a-long-enough-password';
      component.submit();
      http.expectOne(`${base}/auth/signup`).flush({ id: 'abc', email: 'new@pallet.town' });
    });

    it('does not ask for a confirmation when signing in', () => {
      answerWhoAmI();

      component.email = 'ash@pallet.town';
      component.password = 'a-long-enough-password';

      expect(component.confirmationValid).toBeTrue();
      expect(component.canSubmit).toBeTrue();
    });

    it('accepts eight characters, as the server now does', () => {
      answerWhoAmI();

      component.email = 'new@pallet.town';
      component.password = '12345678';

      expect(component.passwordValid).toBeTrue();

      component.password = '1234567';
      expect(component.passwordValid).toBeFalse();
    });

    it('offers to sign in when the address is already registered', () => {
      answerWhoAmI();

      component.setMode('signup');
      component.email = 'ash@pallet.town';
      component.password = 'a-long-enough-password';
      component.passwordConfirmation = 'a-long-enough-password';
      component.submit();

      http.expectOne(`${base}/auth/signup`).flush(
        { error: { code: 'conflict', message: 'An account with that email already exists. Sign in instead.' } },
        { status: 409, statusText: 'Conflict' },
      );
      fixture.detectChanges();

      expect(component.emailTaken).toBeTrue();

      // The button keeps what was typed rather than making them start again.
      component.switchToSignIn();
      expect(component.mode).toBe('signin');
      expect(component.email).toBe('ash@pallet.town');
      expect(component.password).toBe('a-long-enough-password');
    });
  });

  // Rewording here would undo the server's deliberate refusal to say which of
  // the two things was wrong.
  describe('error messages', () => {

    const failLogin = (body: object, status: number) => {
      component.email = 'ash@pallet.town';
      component.password = 'pikachu-i-choose-you';
      component.submit();
      http.expectOne(`${base}/auth/login`).flush(body, { status, statusText: 'Error' });
      fixture.detectChanges();
    };

    it('translates a failure this build recognises', () => {
      // Keyed on the error *code*, never on the server's text, which is
      // English only. Five of the six locales would otherwise read English.
      answerWhoAmI();

      failLogin({ error: { code: 'unauthorized', message: 'That email and password do not match an account.' } }, 401);

      expect(component.error).toBe('account.error.credentials');
      expect(component.busy).toBeFalse();
    });

    it('gives a wrong password and an unknown account the same message', () => {
      // The API refuses to distinguish them. Translating by code keeps that
      // true, because the code is identical in both cases.
      answerWhoAmI();

      failLogin({ error: { code: 'unauthorized', message: 'That email and password do not match an account.' } }, 401);
      const wrongPassword = component.error;

      failLogin({ error: { code: 'unauthorized', message: 'That email and password do not match an account.' } }, 401);

      expect(component.error).toBe(wrongPassword);
    });

    it('falls back to the server\'s own words for a code it has never met', () => {
      // The API deploys on its own schedule. An English sentence that is
      // precise beats a translated one that is wrong.
      answerWhoAmI();

      failLogin({ error: { code: 'teapot', message: 'Something specific and new.' } }, 418);

      expect(component.error).toBe('Something specific and new.');
    });

    it('says the server was unreachable rather than blaming the player', () => {
      answerWhoAmI();

      failLogin(new ProgressEvent('error'), 0);

      expect(component.error).toBe('account.error.offline');
    });
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
