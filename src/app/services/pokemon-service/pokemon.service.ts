import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { nationalDexPokemon } from './national-dex-pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }

  private apiBaseUrl = 'https://pokeapi.co/api/v2';
  nationalDexPokemon = nationalDexPokemon;

  /**
   * Fetches the sprites for a given Pokémon by ID.
   * @param pokemonId The ID of the Pokémon.
   * @returns An Observable of the sprite URLs.
   */
  getPokemonSprites(pokemonId: number): Observable<{ sprite: { front_default: string; front_shiny: string; }; }> {
    const url = `${this.apiBaseUrl}/pokemon/${pokemonId}`;
    return this.http.get<any>(url).pipe(
      retry({
        count: 3,    // Retry up to 3 times
        delay: 1000  // Wait 1 second between retries
      }),
      map((response) => ({
        sprite: response.sprites.other['official-artwork']
      })),
      catchError((error) => {
        console.error(`Failed to fetch Pokémon ${pokemonId}:`, error);
        return throwError(() => new Error('Failed to fetch Pokémon data'));
      })
    );
  }

  getPokemonById(pokemonId: number): PokemonItem | undefined {
    const pokemon = this.nationalDexPokemon.find(pokemon => pokemon.pokemonId === pokemonId);
    return pokemon;
  }

  getAllPokemon(): PokemonItem[] {
    return this.nationalDexPokemon;
  }
}