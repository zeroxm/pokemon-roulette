import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SyncService, SyncStatus } from './sync.service';
import { AuthService } from '../auth-service/auth.service';
import { SyncStateService } from '../sync-state-service/sync-state.service';
import { PokedexService } from '../pokedex-service/pokedex.service';
import { BadgeDexService } from '../badge-dex-service/badge-dex.service';
import { StatsService } from '../stats-service/stats.service';
import { AchievementService } from '../achievement-service/achievement.service';
import { environment } from '../../../environments/environment';

describe('SyncService', () => {
  let sync: SyncService;
  let auth: AuthService;
  let http: HttpTestingController;
  let syncState: SyncStateService;

  const endpoint = `${environment.apiBaseUrl}/v1/sync`;
  const user = { id: 'u1', email: 'ash@pallet.town' };

  /** Signs in, which is what starts the client. */
  const signIn = () => {
    auth.refresh().subscribe();
    http.expectOne(`${environment.apiBaseUrl}/v1/auth/me`).flush(user);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    syncState = TestBed.inject(SyncStateService);
    sync = TestBed.inject(SyncService);
    sync.start();
  });

  afterEach(() => localStorage.clear());

  it('pushes as soon as the player signs in', fakeAsync(() => {
    TestBed.inject(StatsService).increment('spins_total', 7);

    signIn();
    tick();

    const request = http.expectOne(endpoint);
    expect(request.request.body.counters['spins_total']).toBe(7);
    expect(request.request.withCredentials).toBeTrue();

    request.flush({ counters: { spins_total: 7 } });
    expect(syncState.isSynced).toBeTrue();
  }));

  it('merges the account into local state rather than replacing it', fakeAsync(() => {
    // The whole point: a device that has never seen the other one must not
    // lose its own collection by syncing, and must not lose the other's.
    const pokedex = TestBed.inject(PokedexService);
    pokedex.recordCatch(25);

    signIn();
    tick();

    http.expectOne(endpoint).flush({
      pokedex: { '6': { won: true, shiny: true, mega: false, count: 4 } },
      badges: ['boulder'],
    });

    expect(pokedex.currentPokedex.caught['25'].count).toBe(1);
    expect(pokedex.currentPokedex.caught['6'].shiny).toBeTrue();
    expect(TestBed.inject(BadgeDexService).earned.has('boulder')).toBeTrue();
  }));

  it('does not report synced when something was caught mid-request', fakeAsync(() => {
    signIn();
    tick();

    const request = http.expectOne(endpoint);
    TestBed.inject(StatsService).increment('spins_total');
    request.flush({});

    expect(syncState.isSynced).toBeFalse();

    // ...and pushes again, carrying the change that the first request missed.
    tick(3000);
    expect(http.expectOne(endpoint).request.body.counters['spins_total']).toBe(1);
    tick();
  }));

  it('debounces a burst of changes into one request', fakeAsync(() => {
    signIn();
    tick();
    http.expectOne(endpoint).flush({});

    const stats = TestBed.inject(StatsService);
    stats.increment('spins_total');
    tick(500);
    stats.increment('spins_total');
    tick(500);
    stats.increment('spins_total');

    http.expectNone(endpoint);

    tick(3000);
    expect(http.expectOne(endpoint).request.body.counters['spins_total']).toBe(3);
    tick();
  }));

  it('retries with backoff while offline, and loses nothing', fakeAsync(() => {
    TestBed.inject(StatsService).increment('eggs_hatched', 3);

    signIn();
    tick();

    http.expectOne(endpoint).error(new ProgressEvent('offline'), { status: 0 });
    expect(status()).toBe('offline');
    expect(syncState.isSynced).toBeFalse();

    tick(5000);
    http.expectOne(endpoint).error(new ProgressEvent('offline'), { status: 0 });

    // Backoff: nothing at the previous interval, a retry at the doubled one.
    tick(5000);
    http.expectNone(endpoint);
    tick(5000);

    const retry = http.expectOne(endpoint);
    expect(retry.request.body.counters['eggs_hatched']).toBe(3);
    retry.flush({});

    expect(syncState.isSynced).toBeTrue();
    expect(status()).toBe('synced');
  }));

  it('stops syncing on a 401 but keeps local data', fakeAsync(() => {
    TestBed.inject(StatsService).increment('spins_total', 5);

    signIn();
    tick();

    http.expectOne(endpoint).flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${environment.apiBaseUrl}/v1/auth/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(status()).toBe('off');
    expect(TestBed.inject(StatsService).get('spins_total')).toBe(5);

    // No retry storm against a session that has ended.
    tick(60000);
    http.expectNone(endpoint);
  }));

  it('does not announce achievements the account already had', fakeAsync(() => {
    // Adopting a collection re-runs evaluation, so the unlock record has to be
    // in place first or a new device fires a toast for every old achievement.
    const announced: string[] = [];
    TestBed.inject(AchievementService).newlyUnlocked$.subscribe(
      unlocked => announced.push(...unlocked.map(achievement => achievement.id)),
    );

    signIn();
    tick();

    http.expectOne(endpoint).flush({
      pokedex: { '1': { won: true, count: 1 } },
      achievements: { i_choose_you: '2020-01-01T00:00:00Z' },
    });

    expect(announced).toEqual([]);
    expect(TestBed.inject(AchievementService).isUnlocked('i_choose_you')).toBeTrue();
  }));

  it('never syncs for a player with no account', fakeAsync(() => {
    TestBed.inject(StatsService).increment('spins_total');
    tick(60000);
    http.expectNone(endpoint);
    expect(status()).toBe('off');
  }));

  it('keeps preferences but no collections when the player signs out', () => {
    // The shared-device reasoning that justifies wiping a Pokédex does not
    // reach a theme: nobody is contaminated by inheriting dark mode, and
    // wiping it signed a Brazilian player out into an English, light game.
    localStorage.setItem('pokemon-roulette-settings', '{"muteAudio":true}');
    localStorage.setItem('pokemon-roulette-theme', 'plain-dark');
    localStorage.setItem('language', 'pt');
    localStorage.setItem('pokemon-roulette-pokedex', '{"caught":{"25":{"won":true}}}');
    localStorage.setItem('pokemon-roulette-stats', '{"spins_total":9}');
    localStorage.setItem('pokemon-roulette-badge-dex', '["boulder"]');
    localStorage.setItem('pokemon-roulette-achievements', '{"i_choose_you":"2026-01-01T00:00:00Z"}');
    localStorage.setItem('pokemon-roulette-synced', 'true');

    sync.clearLocalData();

    expect(Object.keys(localStorage).sort()).toEqual([
      'language', 'pokemon-roulette-settings', 'pokemon-roulette-theme',
    ]);
  });

  const status = (): SyncStatus => {
    let current: SyncStatus = 'off';
    sync.status$.subscribe(value => (current = value)).unsubscribe();
    return current;
  };
});
