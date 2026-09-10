import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

/** The shape every error response from the API takes. */
interface ApiErrorEnvelope {
  error?: { code?: string; message?: string; request_id?: string };
}

/**
 * API error codes this build can say something better than English about.
 *
 * `invalid_request` is deliberately generic here. The server sends a precise
 * message for it -- which password rule was broken, say -- but the client
 * checks those rules itself before submitting and says so in the player's own
 * language, so reaching this is already an edge case.
 */
const ERROR_KEYS: Readonly<Record<string, string>> = {
  unauthorized: 'account.error.credentials',
  conflict: 'account.error.emailTaken',
  rate_limited: 'account.error.rateLimited',
  invalid_request: 'account.error.invalid',
  internal: 'account.error.server',
};

/**
 * Accounts, and whether there is one.
 *
 * **The game works with no account, forever.** Nothing here may gate play: a
 * failing request means "not signed in", never an error the player has to
 * dismiss before continuing.
 *
 * The session lives in an `HttpOnly` cookie, which JavaScript cannot read by
 * design — that is the whole reason the game moved to a sibling hostname. So
 * "am I signed in" is answered by asking the server, not by inspecting storage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiBaseUrl}/v1`;

  private userSubject$ = new BehaviorSubject<AuthUser | null>(null);
  private checkedSubject$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  get user$(): Observable<AuthUser | null> {
    return this.userSubject$.asObservable();
  }

  get currentUser(): AuthUser | null {
    return this.userSubject$.getValue();
  }

  get isSignedIn(): boolean {
    return this.currentUser !== null;
  }

  /** Whether the initial "who am I" has completed, however it went. */
  get checked$(): Observable<boolean> {
    return this.checkedSubject$.asObservable();
  }

  /**
   * Asks the server who the caller is.
   *
   * Any failure — no session, API down, no network — resolves to "signed out".
   * A player with no account must never see an error for a question they did
   * not ask.
   */
  refresh(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(`${this.base}/auth/me`, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      tap(user => {
        this.userSubject$.next(user);
        this.checkedSubject$.next(true);
      }),
    );
  }

  signup(email: string, password: string): Observable<AuthUser> {
    return this.post<AuthUser>('/auth/signup', { email, password });
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.post<AuthUser>('/auth/login', { email, password });
  }

  /** Ends this session. */
  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.userSubject$.next(null)));
  }

  /**
   * Ends every session for the account.
   *
   * With no password reset, this is the only recourse a player has if they
   * think someone else is signed in as them.
   */
  logoutEverywhere(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/auth/logout-all`, {}, { withCredentials: true })
      .pipe(tap(() => this.userSubject$.next(null)));
  }

  deleteAccount(password: string): Observable<void> {
    return this.http
      .request<void>('DELETE', `${this.base}/account`, { body: { password }, withCredentials: true })
      .pipe(tap(() => this.userSubject$.next(null)));
  }

  /**
   * The translation key for a failed request, or `null` to show the server's
   * own words.
   *
   * Translating by **code** rather than by message is what lets this be
   * localised at all. Showing the server's text verbatim was deliberate --
   * login answers "wrong password" and "no such account" identically, and a
   * client that guesses a more specific message undoes that -- but verbatim
   * also meant English, in a game that ships in six languages. Mapping the
   * code preserves the ambiguity exactly, because the *code* is identical in
   * both cases too.
   *
   * A code this build does not recognise falls through to the server's text.
   * The API deploys on its own schedule, and an English sentence that is
   * precise beats a translated one that is wrong.
   */
  static errorKeyFor(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse)) {
      return null;
    }

    // No status at all is the network being unreachable, which the server
    // never got to have an opinion about.
    if (error.status === 0) {
      return 'account.error.offline';
    }

    const code = (error.error as ApiErrorEnvelope | null)?.error?.code;
    return code && Object.hasOwn(ERROR_KEYS, code) ? ERROR_KEYS[code] : null;
  }

  /**
   * The message to show a player for a failed request, when no translation
   * applies. Returns exactly what the API said.
   */
  static messageFor(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiErrorEnvelope | null;
      const message = body?.error?.message;
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }
    return fallback;
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, { withCredentials: true }).pipe(
      tap(user => this.userSubject$.next(user as AuthUser)),
      map(user => user),
      catchError((error: unknown) => throwError(() => error)),
    );
  }
}
