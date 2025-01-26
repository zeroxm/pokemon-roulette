import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { evolutionChain } from './evolution-chain';
import { nationalDexPokemon } from '../../game-data/national-dex-pokemon';

@Injectable({
  providedIn: 'root'
})
export class EvolutionService {

  evolutionChain = evolutionChain;
  nationalDexPokemon = nationalDexPokemon;

  constructor() { }

  canEvolve(pokemon: PokemonItem): boolean {
    return !!this.evolutionChain[pokemon.pokemonId];
  }

  getEvolutions(pokemon: PokemonItem): PokemonItem[] {
    let evolutions: PokemonItem[] = [];
    this.evolutionChain[pokemon.pokemonId].forEach(evolutionId => {
      const evolution = this.nationalDexPokemon.find(pokemon => pokemon.pokemonId === evolutionId);
      if (evolution) {
        evolutions.push(evolution);
      }
    })
    return evolutions;
  }
}
