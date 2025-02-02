import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { nationalDexPokemon } from './national-dex-pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor() { }

  nationalDexPokemon = nationalDexPokemon;


  getPokemonById(pokemonId: number): PokemonItem | undefined {
    return this.nationalDexPokemon.find(pokemon => pokemon.pokemonId === pokemonId);
  }

  getAllPokemon(): PokemonItem[] {
    return this.nationalDexPokemon;
  }
}
