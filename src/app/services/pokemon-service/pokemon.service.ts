import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, shareReplay, throwError } from 'rxjs';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { nationalDexPokemon } from './national-dex-pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }

  private apiBaseUrl = 'https://pokeapi.co/api/v2';
  private spriteCache = new Map<number, Observable<{ sprite: { front_default: string; front_shiny: string; }; }>>();
  private pokemonByIdMap = new Map<number, PokemonItem>(nationalDexPokemon.map(p => [p.pokemonId, p]));
  nationalDexPokemon = nationalDexPokemon;

  /**
   * Fetches the sprites for a given Pokémon by ID.
   * Caches results to avoid duplicate API calls for the same Pokémon.
   * @param pokemonId The ID of the Pokémon.
   * @returns An Observable of the sprite URLs.
   */
  getPokemonSprites(pokemonId: number): Observable<{ sprite: { front_default: string; front_shiny: string; }; }> {
    const cached = this.spriteCache.get(pokemonId);
    if (cached) {
      return cached;
    }

    const url = `${this.apiBaseUrl}/pokemon/${pokemonId}`;
    const request$ = this.http.get<any>(url).pipe(
      retry({
        count: 3,    // Retry up to 3 times
        delay: 1000  // Wait 1 second between retries
      }),
      map((response) => ({
        sprite: response.sprites.other['official-artwork']
      })),
      catchError((error) => {
        this.spriteCache.delete(pokemonId);
        console.error(`Failed to fetch Pokémon ${pokemonId}:`, error);
        return throwError(() => new Error('Failed to fetch Pokémon data'));
      }),
      shareReplay(1)
    );

    this.spriteCache.set(pokemonId, request$);
    return request$;
  }

  getPokemonById(pokemonId: number): PokemonItem | undefined {
    return this.pokemonByIdMap.get(pokemonId);
  }

  getPokemonByIdArray(pokemonIds: number[]): PokemonItem[] {
    return pokemonIds
      .map(pokemonId => this.pokemonByIdMap.get(pokemonId))
      .filter((pokemon): pokemon is PokemonItem => pokemon !== undefined);
  }

  getAllPokemon(): PokemonItem[] {
    return this.nationalDexPokemon;
  }
}