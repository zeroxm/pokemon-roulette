import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

import { AuthService } from '../auth-service/auth.service';
import { SyncStateService } from '../sync-state-service/sync-state.service';
import { PokedexService, PokedexEntry } from '../pokedex-service/pokedex.service';
import { BadgeDexService } from '../badge-dex-service/badge-dex.service';
import { StatsService } from '../stats-service/stats.service';
import { AchievementService } from '../achievement-service/achievement.service';
import { SettingsService } from '../settings-service/settings.service';
import { SyncSnapshot, mergeSnapshots, parseSyncSnapshot } from './sync-snapshot';

/** What the account screen shows. Nothing more intrusive than this exists. */
export type SyncStatus = 'off' | 'syncing' | 'synced' | 'pending' | 'offline';

/** Debounce before pushing. A six-Pokémon run is one round trip, not six. */
const PUSH_DEBOUNCE_MS = 3000;

const FIRST_RETRY_MS = 5000;
const MAX_RETRY_MS = 5 * 60 * 1000;

/**
 * Moves a player's collections between their devices.
 *
 * **There is no queue of mutations, and that is the design, not an omission.**
 * The client sends *absolute state*: the whole collection, every time. So a
 * request that failed needs no record of what it contained — the next push
 * carries the same ground truth plus whatever happened since. One boolean
 * (`SyncStateService`) replaces a durable outbox, retries are free because a
 * repeat is a no-op, and there is nothing to deduplicate and nothing to sweep.
 *
 * The trade is written down in `docs/sync.md`: two devices playing offline
 * *simultaneously* under-count, because counters merge by max rather than by
 * summing deltas. Accepted, because the window needs two devices genuinely
 * offline at once and the cost is a few counter ticks.
 *
 * **Every failure leaves the game fully playable.** Nothing here may throw into
 * the game loop, block a spin, or show a player an error for a question they
 * never asked.
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly endpoint = `${environment.apiBaseUrl}/v1/sync`;

  private statusSubject$ = new BehaviorSubject<SyncStatus>('off');

  private pending: Subscription | null = null;
  private inFlight = false;
  private retryDelay = FIRST_RETRY_MS;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private syncState: SyncStateService,
    private pokedexService: PokedexService,
    private badgeDexService: BadgeDexService,
    private statsService: StatsService,
    private achievementService: AchievementService,
    private settingsService: SettingsService,
  ) {}

  get status$(): Observable<SyncStatus> {
    return this.statusSubject$.asObservable();
  }

  /**
   * Starts syncing. Called once, from the app root.
   *
   * Signing in pushes immediately, which is also how an anonymous player's
   * collection reaches a brand new account: their local state is posted as an
   * ordinary sync and unioned in. **Signing up is not a special case and must
   * not get its own code path** — everything is grow-only, so "import my local
   * data" and "sync" are the same operation.
   */
  start(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.schedule(0);
      } else {
        this.cancel();
        this.statusSubject$.next('off');
      }
    });

    this.syncState.synced$.subscribe(synced => {
      if (!synced && this.authService.isSignedIn) {
        this.schedule(PUSH_DEBOUNCE_MS);
      }
    });
  }

  /** Pushes now, for the account screen's retry. Safe to call at any time. */
  syncNow(): void {
    if (this.authService.isSignedIn) {
      this.schedule(0);
    }
  }

  /**
   * Erases every collection from this device.
   *
   * Signing out wipes local data, which is the opposite of the usual default
   * and is deliberate: this game gets played on shared devices, and leaving a
   * collection behind means the next person silently merges their progress
   * into someone else's. Grow-only data cannot be separated back out
   * afterwards, so the contamination would be permanent.
   *
   * Reloading afterwards rather than resetting each service in place: every
   * service holds its state in memory, and a missed one would resurrect the
   * previous player's Pokédex the next time it wrote to storage.
   */
  clearLocalDataAndReload(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear local data on sign out:', error);
    }

    window.location.reload();
  }

  private schedule(delayMs: number): void {
    this.cancel();
    this.pending = timer(delayMs).subscribe(() => this.push());
  }

  private cancel(): void {
    this.pending?.unsubscribe();
    this.pending = null;
  }

  private push(): void {
    if (this.inFlight || !this.authService.isSignedIn) {
      return;
    }

    this.inFlight = true;
    this.statusSubject$.next('syncing');

    const sent = this.snapshot();

    this.http
      .post(this.endpoint, sent, { withCredentials: true })
      .subscribe({
        next: body => {
          this.inFlight = false;
          this.retryDelay = FIRST_RETRY_MS;

          // Whether anything was caught while the request was in the air.
          // Compared before adopting, and between two snapshots built the same
          // way, so the server having *more* than we sent does not read as a
          // local change.
          const changedDuringFlight = !sameSnapshot(sent, this.snapshot());

          this.adopt(parseSyncSnapshot(body));

          if (changedDuringFlight) {
            this.statusSubject$.next('pending');
            this.schedule(PUSH_DEBOUNCE_MS);
          } else {
            this.syncState.markSynced();
            this.statusSubject$.next('synced');
          }
        },
        error: (error: unknown) => {
          this.inFlight = false;
          this.onFailure(error);
        },
      });
  }

  /**
   * Applies the server's answer, re-merged with whatever is local right now.
   *
   * The re-merge is not belt-and-braces. A push takes real time, and anything
   * caught during it is in local state but not in the response — adopting the
   * response alone would drop it, and the player would watch a Pokémon they
   * just caught disappear. Merging is cheap and makes that window harmless.
   */
  private adopt(fromServer: SyncSnapshot): void {
    const merged = mergeSnapshots(fromServer, this.snapshot());

    // Achievements first: adopting a collection re-runs achievement
    // evaluation, and doing that before the unlock record is in place would
    // announce another device's months-old achievements as if earned now.
    this.achievementService.adopt(merged.achievements);

    this.pokedexService.adopt(toPokedexEntries(merged));
    this.badgeDexService.adopt(merged.badges);
    this.statsService.adopt(merged.counters);

    if (merged.settings) {
      this.settingsService.adopt(merged.settings);
    }
  }

  private onFailure(error: unknown): void {
    const status = error instanceof HttpErrorResponse ? error.status : 0;

    // A session that ended mid-play. Stop syncing and let the account screen
    // reflect it — but **keep local data**: only an explicit sign-out wipes,
    // and a player whose cookie expired has not asked to lose anything.
    if (status === 401) {
      this.cancel();
      this.statusSubject$.next('off');
      this.authService.refresh().subscribe();
      return;
    }

    this.statusSubject$.next(status === 0 ? 'offline' : 'pending');

    this.schedule(this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS);
  }

  private snapshot(): SyncSnapshot {
    const pokedex: SyncSnapshot['pokedex'] = {};
    for (const [id, entry] of Object.entries(this.pokedexService.currentPokedex.caught)) {
      pokedex[id] = {
        won: Boolean(entry.won),
        shiny: Boolean(entry.shiny),
        mega: Boolean(entry.mega),
        count: entry.count && entry.count > 0 ? entry.count : 1,
      };
    }

    return {
      pokedex,
      badges: [...this.badgeDexService.earned].sort(),
      achievements: { ...this.achievementService.unlocked },
      counters: { ...this.statsService.currentStats } as Record<string, number>,
      settings: this.settingsService.currentSettings,
    };
  }
}

function toPokedexEntries(snapshot: SyncSnapshot): Record<string, PokedexEntry> {
  const caught: Record<string, PokedexEntry> = {};
  for (const [id, entry] of Object.entries(snapshot.pokedex)) {
    caught[id] = { won: entry.won, shiny: entry.shiny, mega: entry.mega, count: entry.count };
  }
  return caught;
}

/**
 * Enough for snapshots: plain JSON with no `undefined`, and both sides are
 * built by the same function, so key order matches by construction.
 */
function sameSnapshot(a: SyncSnapshot, b: SyncSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
