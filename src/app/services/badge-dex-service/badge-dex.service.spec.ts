import { TestBed } from '@angular/core/testing';

import {
  ALL_BADGE_IDS,
  BadgeDexService,
  badgeId,
  badgeRoundsForGeneration,
} from './badge-dex.service';
import { SyncStateService } from '../sync-state-service/sync-state.service';

describe('BadgeDexService', () => {
  let service: BadgeDexService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgeDexService);
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('badge ids', () => {
    // Badges have no id of their own, only a translation key. The namespace is
    // stripped because the backend's id pattern rejects the dot.
    it('strips the i18n namespace', () => {
      expect(badgeId({ name: 'badges.bug_paldea', sprite: '' })).toBe('bug_paldea');
    });

    it('produces ids the backend will accept', () => {
      for (const id of ALL_BADGE_IDS) {
        expect(id).withContext(`${id} is not a valid badge id`).toMatch(/^[a-z0-9_]{1,64}$/);
      }
    });

    it('is unique across every generation', () => {
      // Type-named badges repeat across regions; the _kalos/_galar/_paldea
      // suffixes are what keep them distinct.
      expect(ALL_BADGE_IDS.size).toBe(77);
    });

    it('groups a round that offers a choice', () => {
      const rounds = badgeRoundsForGeneration(7);
      const withChoice = rounds.filter(round => round.length > 1);

      expect(withChoice.length)
        .withContext("Alola's Z-crystal rounds offer alternatives")
        .toBeGreaterThan(0);
    });

    it('gives every generation eight rounds', () => {
      for (let generation = 1; generation <= 9; generation++) {
        expect(badgeRoundsForGeneration(generation).length)
          .withContext(`generation ${generation}`)
          .toBe(8);
      }
    });
  });

  describe('recording', () => {
    it('remembers a badge permanently', () => {
      service.record({ name: 'badges.boulder', sprite: '' });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      expect(TestBed.inject(BadgeDexService).earned.has('boulder')).toBeTrue();
    });

    it('is idempotent', () => {
      service.record({ name: 'badges.boulder', sprite: '' });
      service.record({ name: 'badges.boulder', sprite: '' });

      expect(service.earned.size).toBe(1);
    });

    it('marks local state dirty', () => {
      const syncState = TestBed.inject(SyncStateService);
      syncState.markSynced();

      service.record({ name: 'badges.cascade', sprite: '' });

      expect(syncState.isSynced).toBeFalse();
    });

    it('drops a stored id this build does not know', () => {
      localStorage.setItem('pokemon-roulette-badge-dex', JSON.stringify(['boulder', 'badge_from_the_future']));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      const earned = TestBed.inject(BadgeDexService).earned;

      expect(earned.has('boulder')).toBeTrue();
      expect(earned.has('badge_from_the_future'))
        .withContext('a badge that no longer exists would count towards "every badge" forever')
        .toBeFalse();
    });
  });
});
