import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Badge } from '../../interfaces/badge';
import { badgesByGeneration } from '../badges-service/badges-data';
import { SyncStateService } from '../sync-state-service/sync-state.service';

/**
 * Every badge the player has ever earned, across every run.
 *
 * `TrainerService.trainerBadges` is the badges of the *current* run and dies
 * with it. This is the lifetime record — the trophy case — and it is one of the
 * three collections that sync.
 *
 * Grow-only: badges are only ever added.
 */
@Injectable({ providedIn: 'root' })
export class BadgeDexService {
  private readonly STORAGE_KEY = 'pokemon-roulette-badge-dex';

  private earnedSubject$: BehaviorSubject<ReadonlySet<string>>;

  constructor(private syncState: SyncStateService) {
    this.earnedSubject$ = new BehaviorSubject(this.getInitialBadges());
  }

  get earned$(): Observable<ReadonlySet<string>> {
    return this.earnedSubject$.asObservable();
  }

  get earned(): ReadonlySet<string> {
    return this.earnedSubject$.getValue();
  }

  has(badge: Badge): boolean {
    return this.earned.has(badgeId(badge));
  }

  /** Records a badge permanently. A badge already held is a no-op. */
  record(badge: Badge): void {
    const id = badgeId(badge);
    if (!id || this.earned.has(id)) {
      return;
    }

    const next = new Set(this.earned);
    next.add(id);
    this.save(next);
    this.syncState.markDirty();
    this.earnedSubject$.next(next);
  }

  /** Replaces the trophy case with merged state. See PokedexService.adopt. */
  adopt(badgeIds: readonly string[]): void {
    const next = new Set(badgeIds.filter(id => ALL_BADGE_IDS.has(id)));
    this.save(next);
    this.earnedSubject$.next(next);
  }

  private save(badges: ReadonlySet<string>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...badges].sort()));
    } catch (error) {
      console.error('Failed to save the badge dex to localStorage:', error);
    }
  }

  private getInitialBadges(): ReadonlySet<string> {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (!storageItem) {
      return new Set();
    }

    try {
      const parsed: unknown = JSON.parse(storageItem);
      if (!Array.isArray(parsed)) {
        return new Set();
      }
      // Only ids this build knows: a badge that no longer exists cannot be
      // displayed, and would count towards "every badge in the game" forever.
      return new Set(parsed.filter((id): id is string => typeof id === 'string' && ALL_BADGE_IDS.has(id)));
    } catch (error) {
      console.error('Invalid badge dex localStorage item:', storageItem, 'falling back to none earned');
      return new Set();
    }
  }
}

/**
 * The stored id for a badge.
 *
 * Badges have no id of their own — only a translation key like
 * `badges.bug_paldea`, which is unique across all 77 of them. The `badges.`
 * prefix is stripped because it is an i18n namespace, not part of the
 * identity, and because the backend's id pattern rejects the dot.
 */
export function badgeId(badge: Badge): string {
  return badge.name.startsWith('badges.') ? badge.name.slice('badges.'.length) : badge.name;
}

/** The badges defined for one generation, flattened across alternatives. */
export function badgeIdsForGeneration(generation: number): string[] {
  return (badgesByGeneration[generation] ?? []).flatMap(round =>
    Array.isArray(round) ? round.map(badgeId) : [badgeId(round)],
  );
}

/**
 * The badges for each round of a generation, kept grouped.
 *
 * Four rounds offer a choice — Alola's Z-crystals, for instance — so beating
 * all eight gyms of a region means holding one badge from each round, not
 * every badge the region defines.
 */
export function badgeRoundsForGeneration(generation: number): string[][] {
  return (badgesByGeneration[generation] ?? []).map(round =>
    Array.isArray(round) ? round.map(badgeId) : [badgeId(round)],
  );
}

export const GENERATIONS_WITH_BADGES: readonly number[] = Object.keys(badgesByGeneration)
  .map(Number)
  .sort((a, b) => a - b);

/** Every badge id in the game, alternatives included. */
export const ALL_BADGE_IDS: ReadonlySet<string> = new Set(
  GENERATIONS_WITH_BADGES.flatMap(badgeIdsForGeneration),
);
