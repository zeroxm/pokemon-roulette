import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { MainGameButtonComponent } from '../main-game-button/main-game-button.component';
import { AuthService, AuthUser } from '../services/auth-service/auth.service';
import { SyncStateService } from '../services/sync-state-service/sync-state.service';
import { SyncService, SyncStatus } from '../services/sync-service/sync.service';

/** Matches the backend, which rejects anything shorter. */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Permissive on purpose, like the server's own check: this rejects nonsense
 * without pretending to know which addresses can receive mail. Nothing here
 * sends any.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'signin' | 'signup';

/**
 * Account management, on a screen of its own.

 *
 *
 * **An account is optional and always will be.** Nothing here gates play,
 * nothing nags, and a signed-out player's experience is exactly what it was
 * before accounts existed. This screen is the only place the subject comes up.
 */
@Component({
  selector: 'app-account',
  imports: [CommonModule, NgIconsModule, TranslatePipe, MainGameButtonComponent],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private syncState: SyncStateService,
    private syncService: SyncService,
    private translate: TranslateService,
  ) {}

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;

  mode: Mode = 'signin';
  user: AuthUser | null = null;
  checked = false;
  busy = false;
  error = '';
  confirmingDelete = false;
  confirmingSignOut = false;
  syncStatus: SyncStatus = 'off';

  // Two text fields and a password confirmation. A forms module for this would
  // be 4.5 kB of framework to validate an email and count characters: enough
  // to breach the bundle budget on its own.
  email = '';
  password = '';
  // Signup only. There is no password reset, so a typo in the one field would
  // be an account nobody can ever open -- which is the whole reason to ask
  // twice. Signing in does not need it: getting it wrong there just fails.
  passwordConfirmation = '';
  deletePassword = '';
  touched = false;

  /** Set when signup was refused because the address is already registered. */
  emailTaken = false;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.authService.user$.subscribe(user => (this.user = user)));
    this.subscriptions.add(this.authService.checked$.subscribe(checked => (this.checked = checked)));
    this.subscriptions.add(this.syncService.status$.subscribe(status => (this.syncStatus = status)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get hasUnsyncedProgress(): boolean {
    return !this.syncState.isSynced;
  }

  setMode(mode: Mode): void {
    this.mode = mode;
    this.error = '';
    this.touched = false;
    this.emailTaken = false;
    this.passwordConfirmation = '';
  }

  /** Offered when signup reports the address is taken; keeps what was typed. */
  switchToSignIn(): void {
    const email = this.email;
    const password = this.password;
    this.setMode('signin');
    this.email = email;
    this.password = password;
  }

  get emailValid(): boolean {
    return EMAIL_PATTERN.test(this.email.trim());
  }

  get passwordValid(): boolean {
    return this.password.length >= MIN_PASSWORD_LENGTH;
  }

  get confirmationValid(): boolean {
    return this.mode === 'signin' || this.passwordConfirmation === this.password;
  }

  get canSubmit(): boolean {
    return this.emailValid && this.passwordValid && this.confirmationValid && !this.busy;
  }

  submit(): void {
    this.touched = true;
    this.emailTaken = false;

    if (!this.canSubmit) {
      return;
    }

    const email = this.email.trim();
    const request = this.mode === 'signup'
      ? this.authService.signup(email, this.password)
      : this.authService.login(email, this.password);

    this.run(request, 'account.error.generic', () => {
      this.email = '';
      this.password = '';
      this.passwordConfirmation = '';
      this.touched = false;
    });
  }

  retrySync(): void {
    this.syncService.syncNow();
  }

  /**
   * Signing out wipes this device.
   *
   * Unsynced progress is therefore destroyed by it, so that case asks first:
   * "you have progress not yet saved to your account" is a sentence a player
   * needs to read before, not after.
   */
  signOut(): void {
    if (this.hasUnsyncedProgress && !this.confirmingSignOut) {
      this.confirmingSignOut = true;
      return;
    }

    this.run(this.authService.logout(), 'account.error.generic', () => this.wipe());
  }

  signOutEverywhere(): void {
    if (this.hasUnsyncedProgress && !this.confirmingSignOut) {
      this.confirmingSignOut = true;
      return;
    }

    this.run(this.authService.logoutEverywhere(), 'account.error.generic', () => this.wipe());
  }

  cancelSignOut(): void {
    this.confirmingSignOut = false;
  }

  deleteAccount(): void {
    if (this.deletePassword.length === 0 || this.busy) {
      return;
    }

    this.run(this.authService.deleteAccount(this.deletePassword), 'account.error.generic', () => {
      this.deletePassword = '';
      this.confirmingDelete = false;
      this.wipe();
    });
  }

  private wipe(): void {
    this.syncService.clearLocalDataAndReload();
  }

  /**
   * Runs a request, showing a translated message for any failure this build
   * recognises and the server's own words for anything else.
   *
   * The translation is keyed on the API's error *code*, never on its text.
   * Signup and login answer "wrong password" and "no account" identically on
   * purpose, and their codes match too, so this cannot undo that.
   */
  private run<T>(request: Observable<T>, fallbackKey: string, onSuccess?: () => void): void {
    this.busy = true;
    this.error = '';

    request.subscribe({
      next: () => {
        this.busy = false;
        onSuccess?.();
      },
      error: (failure: unknown) => {
        this.busy = false;

        const key = AuthService.errorKeyFor(failure);
        this.error = key
          ? (this.translate.instant(key) as string)
          : AuthService.messageFor(failure, this.translate.instant(fallbackKey) as string);

        // The server's message says "Sign in instead"; this is the button
        // that does it, rather than making them find the tab and retype.
        this.emailTaken = failure instanceof HttpErrorResponse && failure.status === 409;
      },
    });
  }
}
