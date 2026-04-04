import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

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
    const key = String(pokemonId);
    const existing = current.caught[key];
    if (existing && (!shiny || existing.shiny)) {
      return;  // already caught AND (not shiny OR already has shiny flag)
    }
    const sprite = this.getSpriteUrl(pokemonId);
    const updated: PokedexData = {
      caught: {
        ...current.caught,
        [key]: {
          won: existing?.won ?? false,
          sprite: existing?.sprite ?? sprite,
          ...(shiny ? { shiny: true } : {}),
        },
      },
    };
    this.updatePokedex(updated);
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
    return fromStorage ?? this.defaultPokedex;
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
