import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonSpriteService {

  private apiBaseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) { }

  /**
   * Fetches the sprites for a given Pokémon by ID.
   * @param pokemonId The ID of the Pokémon.
   * @returns An Observable of the sprite URLs.
   */
  getPokemonSprites(pokemonId: number): Observable<{ sprite: { front_default: string; front_shiny: string; };}> {
    const url = `${this.apiBaseUrl}/pokemon/${pokemonId}`;
    return this.http.get<any>(url).pipe(
      map((response) => ({
        sprite: response.sprites.other['official-artwork']
      }))
    );
  }
}