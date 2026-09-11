import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { PokedexData, PokedexService } from '../pokedex-service/pokedex.service';
import { StatsService } from '../stats-service/stats.service';
import { BadgeDexService } from '../badge-dex-service/badge-dex.service';
import { SyncStateService } from '../sync-state-service/sync-state.service';
import { nationalDexPokemon } from '../pokemon-service/national-dex-pokemon';
import { ACHIEVEMENTS, Achievement, AchievementContext, Progress } from './achievement-catalog';

/**
 * The species the Pokédex screen counts.
 *
 * Alternate forms are stored in the Pokédex under their own ids -- Mega
 * Charizard X is 10034 alongside Charizard's 6 -- and they are not National
 * Dex species. Counting them made the achievements disagree with the Pokédex
 * screen the player is looking at: three species registered, "4/10" on the
 * collection achievements. The same list the Pokédex counts is the only
 * answer that can stay in step with it.
 */
const NATIONAL_DEX_IDS: ReadonlySet<number> = new Set(
  nationalDexPokemon.map(pokemon => pokemon.pokemonId),
);

/** The collection as the Pokédex screen counts it: species, not entries. */
export interface CollectionCounts {
  readonly species: number;
  readonly shinies: number;
}

/** When each achievement was earned, keyed by id. ISO 8601, UTC. */
export type AchievementUnlocks = Readonly<Record<string, string>>;

/**
 * Decides what the player has earned, and announces what is new.
 *
 * Every achievement is *derivable* from the collections, so the unlocked set
 * could be recomputed from scratch at any time. It is stored anyway, for one
 * reason: **notification state.** Without a record of what has already been
 * announced, a player signing in on a new device would be met with fifty
 * toasts at once.
 *
 * That storage is also why a stored unlock is never taken away. Retuning a
 * threshold can leave one that no longer derives, and having something you
 * earned removed by a tuning change is the worse outcome.
 */
@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly STORAGE_KEY = 'pokemon-roulette-achievements';

  private unlockedSubject$: BehaviorSubject<AchievementUnlocks>;
  private newlyUnlockedSubject$ = new Subject<Achievement[]>();
  private progressSubject$ = new BehaviorSubject<ReadonlyMap<string, Progress>>(new Map());
  private collectionSubject$ = new BehaviorSubject<CollectionCounts>({ species: 0, shinies: 0 });

  constructor(
    private pokedexService: PokedexService,
    private statsService: StatsService,
    private badgeDexService: BadgeDexService,
    private syncState: SyncStateService,
  ) {
    const stored = this.getStoredUnlocks();
    this.unlockedSubject$ = new BehaviorSubject(stored);

    // A player who has never had achievements evaluated has earned everything
    // their collection already implies, but earned it *before* now. Announcing
    // it would fire a dozen toasts at a longtime player for things they did
    // months ago, so the first pass records silently.
    let announce = Object.keys(stored).length > 0 || localStorage.getItem(this.STORAGE_KEY) !== null;

    combineLatest([
      this.pokedexService.pokedex$,
      this.statsService.stats$,
      this.badgeDexService.earned$,
    ]).subscribe(([pokedex, , badges]) => {
      // Guarded because this runs synchronously from the middle of the game
      // loop: StatsService.increment emits, which lands here, and a progress
      // function throwing on unexpected data would unwind back into whatever
      // was spinning a wheel. A broken achievement must not break a run.
      //
      // Subscriber errors are a separate matter and RxJS already isolates
      // those; this covers the evaluation itself.
      try {
        this.evaluate(pokedex, badges, announce);
      } catch (error) {
        console.error('Failed to evaluate achievements:', error);
      }
      announce = true;
    });
  }

  get unlocked$(): Observable<AchievementUnlocks> {
    return this.unlockedSubject$.asObservable();
  }

  get unlocked(): AchievementUnlocks {
    return this.unlockedSubject$.getValue();
  }

  /** Achievements that just became earned. What the milestone toast listens to. */
  get newlyUnlocked$(): Observable<Achievement[]> {
    return this.newlyUnlockedSubject$.asObservable();
  }

  /** Current progress for every achievement, for the achievements screen. */
  /**
   * How much of the collection exists, counted once.
   *
   * The achievements screen used to count Pokédex entries itself, which is
   * how it came to show "4 Caught" next to achievements reading "3/10" for
   * the same collection: two counts of one thing drift the moment either
   * learns something, and this one learned to skip alternate forms.
   */
  get collection$(): Observable<CollectionCounts> {
    return this.collectionSubject$.asObservable();
  }

  get progress$(): Observable<ReadonlyMap<string, Progress>> {
    return this.progressSubject$.asObservable();
  }

  isUnlocked(id: string): boolean {
    return id in this.unlocked;
  }

  private evaluate(pokedex: PokedexData, badges: ReadonlySet<string>, announce: boolean): void {
    const context = this.buildContext(pokedex, badges);
    this.collectionSubject$.next({ species: context.caught.size, shinies: context.shinyIds.size });

    const progress = new Map<string, Progress>();
    const earned: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const result = achievement.progress(context);
      progress.set(achievement.id, result);

      if (result.current >= result.target && !this.isUnlocked(achievement.id)) {
        earned.push(achievement);
      }
    }

    this.progressSubject$.next(progress);

    if (earned.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    const unlocks: Record<string, string> = { ...this.unlocked };
    for (const achievement of earned) {
      unlocks[achievement.id] = now;
    }

    this.save(unlocks);
    this.syncState.markDirty();
    this.unlockedSubject$.next(unlocks);

    if (announce) {
      this.newlyUnlockedSubject$.next(earned);
    }
  }

  private buildContext(pokedex: PokedexData, badges: ReadonlySet<string>): AchievementContext {
    const caught = new Set<number>();
    const shinyIds = new Set<number>();
    let megaCount = 0;
    let highestCatchCount = 0;

    for (const [key, entry] of Object.entries(pokedex.caught)) {
      const id = Number(key);
      if (!Number.isFinite(id)) {
        continue;
      }

      if (NATIONAL_DEX_IDS.has(id)) {
        caught.add(id);
        if (entry.shiny) {
          shinyIds.add(id);
        }
      }
      if (entry.mega) {
        megaCount++;
      }
      highestCatchCount = Math.max(highestCatchCount, entry.count ?? 0);
    }

    return {
      stats: this.statsService.currentStats,
      caught,
      shinyIds,
      megaCount,
      badges,
      highestCatchCount,
    };
  }

  /**
   * Replaces the unlock record with merged state.
   *
   * **The sync client must call this before adopting the collections.** Every
   * collection emission re-runs `evaluate`, so adopting another device's
   * Pokédex first would announce fifty achievements at once for things earned
   * months ago on that device: the exact toast storm the stored record exists
   * to prevent.
   */
  adopt(unlocks: AchievementUnlocks): void {
    const known = new Set(ACHIEVEMENTS.map(achievement => achievement.id));
    const filtered: Record<string, string> = {};
    for (const [id, at] of Object.entries(unlocks)) {
      if (known.has(id)) {
        filtered[id] = at;
      }
    }

    this.save(filtered);
    this.unlockedSubject$.next(filtered);
  }

  private save(unlocks: AchievementUnlocks): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlocks));
    } catch (error) {
      console.error('Failed to save achievements to localStorage:', error);
    }
  }

  private getStoredUnlocks(): AchievementUnlocks {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (!storageItem) {
      return {};
    }

    try {
      const parsed: unknown = JSON.parse(storageItem);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }

      const known = new Set(ACHIEVEMENTS.map(a => a.id));
      const unlocks: Record<string, string> = {};
      for (const [id, at] of Object.entries(parsed as Record<string, unknown>)) {
        // An id this build does not know cannot be displayed, and would count
        // towards nothing. Dropping it also keeps a typo from living forever.
        if (known.has(id) && typeof at === 'string') {
          unlocks[id] = at;
        }
      }
      return unlocks;
    } catch (error) {
      console.error('Invalid achievements localStorage item:', storageItem, 'falling back to none unlocked');
      return {};
    }
  }
}
