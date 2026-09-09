import { TestBed } from '@angular/core/testing';

import { StatsService, PlayerStats } from './stats.service';
import { championRegionKey, playedRegionKey } from './counter-keys';
import { SyncStateService } from '../sync-state-service/sync-state.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsService);
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('counters', () => {
    it('reads an untouched counter as zero rather than undefined', () => {
      expect(service.get('runs_completed')).toBe(0);
    });

    it('accumulates', () => {
      service.increment('spins_total');
      service.increment('spins_total', 4);

      expect(service.get('spins_total')).toBe(5);
    });

    it('ignores a non-positive increment', () => {
      service.increment('spins_total', 3);
      service.increment('spins_total', -2);
      service.increment('spins_total', 0);

      expect(service.get('spins_total'))
        .withContext('counters are grow-only; a negative increment is a bug, not history')
        .toBe(3);
    });

    it('ignores a non-finite increment', () => {
      service.increment('spins_total', Number.NaN);
      expect(service.get('spins_total')).toBe(0);
    });

    it('stores nothing for a counter that never moved', () => {
      service.increment('spins_total');

      const stored = JSON.parse(localStorage.getItem('pokemon-roulette-stats')!) as PlayerStats;

      expect(Object.keys(stored))
        .withContext('only non-zero counters are stored, as on the server')
        .toEqual(['spins_total']);
    });

    it('emits on change', () => {
      const seen: PlayerStats[] = [];
      service.stats$.subscribe(stats => seen.push(stats));

      service.increment('eggs_hatched');

      expect(seen.length).toBe(2);
      expect(seen[1]['eggs_hatched']).toBe(1);
    });
  });

  describe('recording a completed run', () => {
    it('counts the run and the region', () => {
      service.recordChampion(4, 6);

      expect(service.get('runs_completed')).toBe(1);
      expect(service.get(championRegionKey(4))).toBe(1);
    });

    it('counts a full team of six', () => {
      service.recordChampion(1, 6);

      expect(service.get('champion_with_six')).toBe(1);
      expect(service.get('champion_with_three_or_fewer')).toBe(0);
    });

    it('counts three or fewer', () => {
      service.recordChampion(1, 3);

      expect(service.get('champion_with_three_or_fewer')).toBe(1);
      expect(service.get('champion_with_six')).toBe(0);
    });

    it('counts neither for a team in between', () => {
      service.recordChampion(1, 4);

      expect(service.get('champion_with_six')).toBe(0);
      expect(service.get('champion_with_three_or_fewer')).toBe(0);
    });

    it('records the region a run started in separately from winning it', () => {
      service.recordRunStarted(7);

      expect(service.get(playedRegionKey(7))).toBe(1);
      expect(service.get(championRegionKey(7)))
        .withContext('starting a run in a region is not beating it')
        .toBe(0);
    });
  });

  describe('reading stored stats', () => {
    const read = (stored: unknown): PlayerStats => {
      localStorage.setItem('pokemon-roulette-stats', JSON.stringify(stored));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      return TestBed.inject(StatsService).currentStats;
    };

    it('survives a reload', () => {
      service.increment('runs_completed', 12);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(TestBed.inject(StatsService).get('runs_completed')).toBe(12);
    });

    it('drops a key this build does not know', () => {
      const stats = read({ runs_completed: 3, counter_from_the_future: 9 }) as Record<string, unknown>;

      expect(stats['runs_completed']).toBe(3);
      expect(stats['counter_from_the_future'])
        .withContext('an unknown key may be a typo, or from a build whose meaning this one cannot honour')
        .toBeUndefined();
    });

    it('drops a value of the wrong type', () => {
      const stats = read({ runs_completed: 'lots', spins_total: 4 }) as Record<string, unknown>;

      expect(stats['runs_completed']).toBeUndefined();
      expect(stats['spins_total']).toBe(4);
    });

    it('drops a negative value', () => {
      const stats = read({ runs_completed: -5 }) as Record<string, unknown>;
      expect(stats['runs_completed']).toBeUndefined();
    });

    it('accepts a valid region counter', () => {
      const stats = read({ 'champion_region:9': 2 }) as Record<string, unknown>;
      expect(stats['champion_region:9']).toBe(2);
    });

    it('rejects a region outside the nine that exist', () => {
      const stats = read({ 'champion_region:12': 1 }) as Record<string, unknown>;
      expect(stats['champion_region:12']).toBeUndefined();
    });

    it('falls back to empty on a malformed blob', () => {
      localStorage.setItem('pokemon-roulette-stats', 'not json at all');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(TestBed.inject(StatsService).currentStats).toEqual({});
    });
  });

  describe('sync state', () => {
    it('marks local state dirty once a counter changes', () => {
      const syncState = TestBed.inject(SyncStateService);
      syncState.markSynced();
      expect(syncState.isSynced).toBeTrue();

      service.increment('spins_total');

      expect(syncState.isSynced)
        .withContext('local state is ahead of the server again, and signing out would discard it')
        .toBeFalse();
    });
  });
});
