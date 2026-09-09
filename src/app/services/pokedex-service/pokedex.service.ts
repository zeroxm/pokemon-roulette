import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { evolutionChain } from '../evolution-service/evolution-chain';
import { pokemonForms } from '../pokemon-forms-service/pokemon-forms';
import { SyncStateService } from '../sync-state-service/sync-state.service';

export interface PokedexEntry {
  won: boolean;
  shiny?: boolean;
  mega?: boolean;
  /**
   * Times this Pokémon has been obtained.
   *
   * A row exists because it was obtained at least once, so the minimum is 1 and
   * 0 is never meaningful — the backend has a CHECK enforcing that. Entries
   * written before counting existed are seeded to 1 on load: visibly a floor
   * rather than a fabrication.
   */
  count?: number;
}

/**
 * Where a Pokémon's artwork comes from.
 *
 * Derived from the id rather than stored. It used to be a field on every entry,
 * which made a full Pokédex about 110 KB of the same URL repeated a thousand
 * times — and baked today's hot-linked host into every saved account.
 */
export function pokemonSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

export interface PokedexData {
  caught: Record<string, PokedexEntry>;
}

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly STORAGE_KEY = 'pokemon-roulette-pokedex';
  private readonly defaultPokedex: PokedexData = { caught: {} };
  private readonly reverseEvolutionChain = this.buildReverseEvolutionChain();

  private pokedexSubject$: BehaviorSubject<PokedexData>;

  constructor(private syncState: SyncStateService) {
    this.pokedexSubject$ = new BehaviorSubject(this.getInitialPokedex());
  }

  get pokedex$(): Observable<PokedexData> {
    // No distinctUntilChanged: updatePokedex always emits a freshly built object, so reference
    // comparison would never dedupe. It advertised a guarantee it did not provide.
    return this.pokedexSubject$.asObservable();
  }

  get currentPokedex(): PokedexData {
    return this.pokedexSubject$.getValue();
  }

  markSeen(pokemonId: number, shiny: boolean = false): void {
    const current = this.currentPokedex;
    const updatedCaught: Record<string, PokedexEntry> = { ...current.caught };

    let changed = this.upsertSeenEntry(updatedCaught, pokemonId, shiny);

    // TODO(next-task cleanup): remove this temporary shiny propagation bridge once the
    // dedicated shiny consistency pipeline lands in the next task.
    if (shiny) {
      for (const relatedId of this.getRelatedPokemonIds(pokemonId)) {
        changed = this.upsertSeenEntry(updatedCaught, relatedId, true) || changed;
      }
    }

    if (!changed) {
      return;
    }

    this.updatePokedex({ caught: updatedCaught });
  }

  /**
   * Registers a newly obtained Pokémon and counts it.
   *
   * Separate from markSeen because most registrations are *not* catches:
   * evolving, re-registering to mark a shiny, and getting a stolen Pokémon back
   * all pass through the Pokédex without being a new acquisition. Counting them
   * would inflate every total.
   */
  recordCatch(pokemonId: number, shiny: boolean = false): void {
    const updatedCaught: Record<string, PokedexEntry> = { ...this.currentPokedex.caught };
    const key = String(pokemonId);

    // Read the count *before* upserting: upsertSeenEntry seeds a new entry at
    // 1, since a row only exists once a Pokémon was obtained. Adding to that
    // would make every first catch a two.
    const previous = updatedCaught[key]?.count ?? 0;

    this.upsertSeenEntry(updatedCaught, pokemonId, shiny);

    updatedCaught[key] = { ...updatedCaught[key], count: previous + 1 };

    // Shiny propagation runs after the count, so related forms are registered
    // without being counted.
    if (shiny) {
      for (const relatedId of this.getRelatedPokemonIds(pokemonId)) {
        this.upsertSeenEntry(updatedCaught, relatedId, true);
      }
    }

    this.updatePokedex({ caught: updatedCaught });
  }

  markWon(pokemonIds: number[]): void {
    const current = this.currentPokedex;
    const updatedCaught = { ...current.caught };
    for (const pokemonId of pokemonIds) {
      const key = String(pokemonId);
      updatedCaught[key] = { ...updatedCaught[key], won: true };
    }
    this.updatePokedex({ caught: updatedCaught });
  }

  /** Permanently marks that the given Pokémon has mega-evolved at least once. No-op if already set. */
  markMega(pokemonId: number): void {
    const current = this.currentPokedex;
    const key = String(pokemonId);
    const existing = current.caught[key];

    if (existing?.mega) {
      return;
    }

    const updatedCaught = { ...current.caught };
    updatedCaught[key] = { ...existing, won: existing?.won ?? false, mega: true };

    this.updatePokedex({ caught: updatedCaught });
  }

  private updatePokedex(data: PokedexData): void {
    this.savePokedexToStorage(data);
    this.syncState.markDirty();
    this.pokedexSubject$.next(data);
  }

  private getInitialPokedex(): PokedexData {
    const fromStorage = this.getPokedexFromStorage();
    if (!fromStorage) {
      return this.defaultPokedex;
    }

    const upgraded = this.upgradeStoredEntries(fromStorage);
    const { data, changed } = this.normalizeShinyOnLoad(upgraded.data);

    if (changed || upgraded.changed) {
      this.savePokedexToStorage(data);
    }

    return data;
  }

  /**
   * Brings an older stored blob up to the current shape.
   *
   * Two one-time changes, both idempotent: the per-entry `sprite` is dropped
   * because it is derived from the id, and entries predating catch counting are
   * seeded to 1.
   *
   * Seeding to 1 rather than 0 is deliberate. An entry exists because the
   * Pokémon was obtained, so 1 is a floor rather than a fabrication — and a
   * count of 0 beside a caught marker reads as a bug.
   */
  private upgradeStoredEntries(data: PokedexData): { data: PokedexData; changed: boolean } {
    const upgraded: Record<string, PokedexEntry> = {};
    let changed = false;

    for (const [key, entry] of Object.entries(data.caught)) {
      const legacy = entry as PokedexEntry & { sprite?: unknown };

      if ('sprite' in legacy || legacy.count === undefined) {
        changed = true;
      }

      upgraded[key] = {
        won: entry.won,
        ...(entry.shiny ? { shiny: true } : {}),
        ...(entry.mega ? { mega: true } : {}),
        count: typeof entry.count === 'number' && entry.count > 0 ? Math.floor(entry.count) : 1,
      };
    }

    return { data: { caught: upgraded }, changed };
  }

  private upsertSeenEntry(caught: Record<string, PokedexEntry>, pokemonId: number, shiny: boolean): boolean {
    const key = String(pokemonId);
    const existing = caught[key];
    const nextShiny = Boolean(existing?.shiny) || shiny;
    const nextEntry: PokedexEntry = {
      won: existing?.won ?? false,
      ...(nextShiny ? { shiny: true } : {}),
      ...(existing?.mega ? { mega: true } : {}),
      // A row exists because the Pokémon was obtained, so the floor is 1 even
      // for one registered without going through recordCatch.
      count: existing?.count ?? 1,
    };

    const changed =
      !existing ||
      existing.won !== nextEntry.won ||
      Boolean(existing.shiny) !== Boolean(nextEntry.shiny);

    caught[key] = nextEntry;
    return changed;
  }

  private normalizeShinyOnLoad(data: PokedexData): { data: PokedexData; changed: boolean } {
    const normalizedCaught: Record<string, PokedexEntry> = { ...data.caught };
    let changed = false;

    // TODO(next-task cleanup): remove this temporary migration once legacy shiny records
    // are no longer in circulation and propagation is guaranteed upstream.
    for (const [pokemonId, entry] of Object.entries(data.caught)) {
      if (!entry?.shiny) {
        continue;
      }

      for (const relatedId of this.getRelatedPokemonIds(Number(pokemonId))) {
        const relatedKey = String(relatedId);

        // Load-time migration scope: update only entries that already exist in storage.
        if (!normalizedCaught[relatedKey]) {
          continue;
        }

        changed = this.upsertSeenEntry(normalizedCaught, relatedId, true) || changed;
      }
    }

    return {
      data: { caught: normalizedCaught },
      changed,
    };
  }

  private getRelatedPokemonIds(pokemonId: number): Set<number> {
    const related = new Set<number>();
    const queue: number[] = [pokemonId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (related.has(currentId)) {
        continue;
      }

      related.add(currentId);

      for (const neighborId of this.getNeighborIds(currentId)) {
        if (!related.has(neighborId)) {
          queue.push(neighborId);
        }
      }
    }

    return related;
  }

  private getNeighborIds(pokemonId: number): Set<number> {
    const neighbors = new Set<number>();

    for (const evolutionId of evolutionChain[pokemonId] ?? []) {
      neighbors.add(evolutionId);
    }

    for (const preEvolutionId of this.reverseEvolutionChain[pokemonId] ?? []) {
      neighbors.add(preEvolutionId);
    }

    const formIds = this.getFormIdsForPokemon(pokemonId);
    for (const formId of formIds) {
      neighbors.add(formId);
    }

    return neighbors;
  }

  private getFormIdsForPokemon(pokemonId: number): number[] {
    const basePokemonId = this.getBasePokemonIdForForms(pokemonId);
    if (basePokemonId === null) {
      return [];
    }

    return pokemonForms[basePokemonId]?.map(form => form.pokemonId) ?? [];
  }

  private getBasePokemonIdForForms(pokemonId: number): number | null {
    if (pokemonForms[pokemonId]) {
      return pokemonId;
    }

    for (const [basePokemonId, forms] of Object.entries(pokemonForms)) {
      if (forms.some(form => form.pokemonId === pokemonId)) {
        return Number(basePokemonId);
      }
    }

    return null;
  }

  private buildReverseEvolutionChain(): Record<number, number[]> {
    const reverseChain: Record<number, number[]> = {};

    for (const [basePokemonId, evolutions] of Object.entries(evolutionChain)) {
      const baseId = Number(basePokemonId);

      for (const evolutionId of evolutions) {
        if (!reverseChain[evolutionId]) {
          reverseChain[evolutionId] = [];
        }

        reverseChain[evolutionId].push(baseId);
      }
    }

    return reverseChain;
  }

  private savePokedexToStorage(data: PokedexData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save Pokédex to localStorage:', error);
    }
  }

  private getPokedexFromStorage(): PokedexData | null {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (storageItem) {
      try {
        const parsed = JSON.parse(storageItem);
        if (parsed.caught && !Array.isArray(parsed.caught)) {
          return parsed as PokedexData;
        }
      } catch (error) {
        console.error('Invalid pokedex localStorage item:', storageItem, 'falling back to empty pokedex');
      }
    }
    return null;
  }
}
