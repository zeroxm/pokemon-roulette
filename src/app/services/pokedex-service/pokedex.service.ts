import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { evolutionChain } from '../evolution-service/evolution-chain';
import { pokemonForms } from '../pokemon-forms-service/pokemon-forms';

export interface PokedexEntry {
  won: boolean;
  sprite: string | null;
  shiny?: boolean;
}

export interface PokedexData {
  caught: Record<string, PokedexEntry>;
}

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly STORAGE_KEY = 'pokemon-roulette-pokedex';
  private readonly defaultPokedex: PokedexData = { caught: {} };
  private readonly spriteCache = new Map<number, string>();
  private readonly reverseEvolutionChain = this.buildReverseEvolutionChain();

  private pokedexSubject$: BehaviorSubject<PokedexData>;

  constructor() {
    this.pokedexSubject$ = new BehaviorSubject(this.getInitialPokedex());
  }

  get pokedex$(): Observable<PokedexData> {
    return this.pokedexSubject$.asObservable().pipe(distinctUntilChanged());
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

  markWon(pokemonIds: number[]): void {
    const current = this.currentPokedex;
    const updatedCaught = { ...current.caught };
    for (const pokemonId of pokemonIds) {
      const key = String(pokemonId);
      const sprite = this.getSpriteUrl(pokemonId);
      updatedCaught[key] = { ...updatedCaught[key], won: true, sprite: updatedCaught[key]?.sprite ?? sprite };
    }
    this.updatePokedex({ caught: updatedCaught });
  }

  private getSpriteUrl(pokemonId: number): string {
    if (this.spriteCache.has(pokemonId)) {
      return this.spriteCache.get(pokemonId)!;
    }
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    this.spriteCache.set(pokemonId, url);
    return url;
  }

  private updatePokedex(data: PokedexData): void {
    this.savePokedexToStorage(data);
    this.pokedexSubject$.next(data);
  }

  private getInitialPokedex(): PokedexData {
    const fromStorage = this.getPokedexFromStorage();
    if (!fromStorage) {
      return this.defaultPokedex;
    }

    const { data, changed } = this.normalizeShinyOnLoad(fromStorage);
    if (changed) {
      this.savePokedexToStorage(data);
    }

    return data;
  }

  private upsertSeenEntry(caught: Record<string, PokedexEntry>, pokemonId: number, shiny: boolean): boolean {
    const key = String(pokemonId);
    const existing = caught[key];
    const nextShiny = Boolean(existing?.shiny) || shiny;
    const nextEntry: PokedexEntry = {
      won: existing?.won ?? false,
      sprite: existing?.sprite ?? this.getSpriteUrl(pokemonId),
      ...(nextShiny ? { shiny: true } : {}),
    };

    const changed =
      !existing ||
      existing.won !== nextEntry.won ||
      existing.sprite !== nextEntry.sprite ||
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
