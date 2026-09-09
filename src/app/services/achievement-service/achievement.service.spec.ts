import { TestBed } from '@angular/core/testing';

import { AchievementService } from './achievement.service';
import { Achievement } from './achievement-catalog';
import { StatsService } from '../stats-service/stats.service';
import { SyncStateService } from '../sync-state-service/sync-state.service';

describe('AchievementService', () => {
  const withPokedex = (caught: Record<string, unknown>) =>
    localStorage.setItem('pokemon-roulette-pokedex', JSON.stringify({ caught }));

  const inject = (): AchievementService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(AchievementService);
  };

  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(inject()).toBeTruthy();
  });

  it('unlocks what the collection already implies', () => {
    withPokedex({ 25: { won: true, sprite: null } });

    expect(inject().isUnlocked('i_choose_you')).toBeTrue();
  });

  // A longtime player opening the game after this ships has earned a dozen
  // things, but earned them months ago. Announcing them would be a wall of
  // toasts for history.
  it('records the first evaluation silently', () => {
    withPokedex({ 25: { won: true, sprite: null } });

    const service = inject();
    const announced: Achievement[][] = [];
    service.newlyUnlocked$.subscribe(batch => announced.push(batch));

    expect(service.isUnlocked('i_choose_you')).withContext('it should still be recorded').toBeTrue();
    expect(announced).withContext('but not announced').toEqual([]);
  });

  it('announces what is earned afterwards', () => {
    const service = inject();

    const announced: Achievement[] = [];
    service.newlyUnlocked$.subscribe(batch => announced.push(...batch));

    TestBed.inject(StatsService).increment('runs_completed');

    expect(announced.map(a => a.id)).toContain('champion');
  });

  it('announces each achievement once', () => {
    const service = inject();
    const stats = TestBed.inject(StatsService);

    const announced: Achievement[] = [];
    service.newlyUnlocked$.subscribe(batch => announced.push(...batch));

    stats.increment('runs_completed');
    stats.increment('runs_completed');

    expect(announced.filter(a => a.id === 'champion').length)
      .withContext('a second run must not re-announce the first-champion achievement')
      .toBe(1);
  });

  it('survives a reload', () => {
    withPokedex({ 25: { won: true, sprite: null } });
    inject();

    expect(inject().isUnlocked('i_choose_you')).toBeTrue();
  });

  // Retuning a threshold can leave a stored unlock that no longer derives.
  // Taking it away would mean a tuning change removing something earned.
  it('keeps an unlock that no longer derives', () => {
    localStorage.setItem(
      'pokemon-roulette-achievements',
      JSON.stringify({ pokedex_lv_5: '2026-01-01T00:00:00.000Z' }),
    );

    expect(inject().isUnlocked('pokedex_lv_5'))
      .withContext('the Pokédex is empty, yet the player earned this before')
      .toBeTrue();
  });

  it('drops a stored id this build does not know', () => {
    localStorage.setItem(
      'pokemon-roulette-achievements',
      JSON.stringify({ achievement_from_the_future: '2026-01-01T00:00:00.000Z' }),
    );

    expect(inject().isUnlocked('achievement_from_the_future')).toBeFalse();
  });

  it('falls back to none unlocked on a malformed blob', () => {
    localStorage.setItem('pokemon-roulette-achievements', 'not json');

    expect(Object.keys(inject().unlocked)).toEqual([]);
  });

  it('reports progress for every achievement', () => {
    withPokedex({ 25: { won: true, sprite: null }, 6: { won: true, sprite: null } });

    let progress: ReadonlyMap<string, { current: number; target: number }> = new Map();
    inject().progress$.subscribe(p => (progress = p));

    expect(progress.size).toBe(50);
    expect(progress.get('pokedex_lv_1')).toEqual({ current: 2, target: 10 });
  });

  it('marks local state dirty when something unlocks', () => {
    const service = inject();
    TestBed.inject(SyncStateService).markSynced();

    TestBed.inject(StatsService).increment('runs_completed');

    expect(service.isUnlocked('champion')).toBeTrue();
    expect(TestBed.inject(SyncStateService).isSynced)
      .withContext('an unlock is synced state; it has to be pushed')
      .toBeFalse();
  });
});
