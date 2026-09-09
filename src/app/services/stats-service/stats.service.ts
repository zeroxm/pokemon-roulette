import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncStateService } from '../sync-state-service/sync-state.service';
import {
  CounterKey,
  GenerationId,
  championRegionKey,
  isCounterKey,
  playedRegionKey,
} from './counter-keys';

/**
 * Lifetime counters, keyed by their wire names.
 *
 * Absent means zero. Only non-zero counters are stored, which keeps the blob
 * small and matches the backend, where a row exists only once a counter has
 * moved.
 */
export type PlayerStats = Readonly<Partial<Record<CounterKey, number>>>;

/**
 * Everything the game counts over a player's lifetime.
 *
 * Deliberately *not* the Pokédex: how many distinct Pokémon, shinies or megas
 * you have is already answerable from `PokedexService`, and duplicating it here
 * would create two versions of the same truth that could disagree. Achievements
 * read both.
 *
 * Nothing here is ever reset, and nothing decreases — the same grow-only
 * property the backend relies on to merge two devices without losing progress.
 */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly STORAGE_KEY = 'pokemon-roulette-stats';

  private statsSubject$: BehaviorSubject<PlayerStats>;

  constructor(private syncState: SyncStateService) {
    this.statsSubject$ = new BehaviorSubject(this.getInitialStats());
  }

  get stats$(): Observable<PlayerStats> {
    return this.statsSubject$.asObservable();
  }

  get currentStats(): PlayerStats {
    return this.statsSubject$.getValue();
  }

  /** Reads a counter. Absent means zero; callers never need to check. */
  get(key: CounterKey): number {
    return this.currentStats[key] ?? 0;
  }

  /**
   * Adds to a counter.
   *
   * Increments of zero or less are ignored rather than applied: counters are
   * grow-only, and a caller passing a negative number is a bug that should not
   * be able to rewrite history.
   */
  increment(key: CounterKey, by: number = 1): void {
    if (!Number.isFinite(by) || by <= 0) {
      return;
    }

    this.update({ ...this.currentStats, [key]: this.get(key) + Math.floor(by) });
  }

  /** Records that a run began in a region. */
  recordRunStarted(generation: GenerationId): void {
    this.increment(playedRegionKey(generation));
  }

  /**
   * Records a completed run, in one call, because the facts arrive together.
   *
   * `teamSizeAtChampionBattle` is the size when the champion wheel spun, not at
   * the end — depositing to the PC beforehand is allowed, and that moment is
   * what the "Pokémon Stadium" and "Full House" achievements are about.
   */
  recordChampion(generation: GenerationId, teamSizeAtChampionBattle: number): void {
    const next: Record<string, number> = { ...this.currentStats };

    const bump = (key: CounterKey) => {
      next[key] = (next[key] ?? 0) + 1;
    };

    bump('runs_completed');
    bump(championRegionKey(generation));

    if (teamSizeAtChampionBattle >= 6) {
      bump('champion_with_six');
    }
    if (teamSizeAtChampionBattle > 0 && teamSizeAtChampionBattle <= 3) {
      bump('champion_with_three_or_fewer');
    }

    this.update(next as PlayerStats);
  }

  private update(stats: PlayerStats): void {
    const pruned = this.withoutZeros(stats);
    this.saveToStorage(pruned);
    // Local state is ahead of the server again.
    this.syncState.markDirty();
    this.statsSubject$.next(pruned);
  }

  private withoutZeros(stats: PlayerStats): PlayerStats {
    const kept: Record<string, number> = {};
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value === 'number' && value > 0) {
        kept[key] = value;
      }
    }
    return kept as PlayerStats;
  }

  /**
   * Reads stored stats, keeping only what this build can reason about.
   *
   * There is deliberately no backfill from the existing Pokédex. Distinct
   * caught, shinies and megas are *derived* from it rather than counted here,
   * so there is nothing to seed. Run counts genuinely cannot be recovered for
   * players who were here before this shipped, and start at zero.
   */
  private getInitialStats(): PlayerStats {
    const stored = this.getFromStorage();
    if (!stored) {
      return {};
    }

    const stats: Record<string, number> = {};
    for (const [key, value] of Object.entries(stored)) {
      // A key this build does not know is dropped, not carried: it may be a
      // typo, or from a newer build whose meaning this one cannot honour.
      if (!isCounterKey(key)) {
        continue;
      }
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        continue;
      }
      stats[key] = Math.floor(value);
    }

    return stats as PlayerStats;
  }

  private saveToStorage(stats: PlayerStats): void {
    // Wrapped because a private-browsing context throws on write, and losing a
    // counter must never take the game down mid-run.
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save stats to localStorage:', error);
    }
  }

  private getFromStorage(): Record<string, unknown> | null {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (!storageItem) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(storageItem);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch (error) {
      console.error('Invalid stats localStorage item:', storageItem, 'falling back to empty stats');
    }

    return null;
  }
}
