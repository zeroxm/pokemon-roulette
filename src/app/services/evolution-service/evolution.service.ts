import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { evolutionChain } from './evolution-chain';
import { PokemonService } from '../pokemon-service/pokemon.service';

@Injectable({
  providedIn: 'root'
})
export class EvolutionService {

  constructor(private pokemonService: PokemonService) {
    this.nationalDexPokemon = this.pokemonService.getAllPokemon();
  }

  evolutionChain = evolutionChain;
  nationalDexPokemon: PokemonItem[];

  canEvolve(pokemon: PokemonItem): boolean {
    return !!this.evolutionChain[pokemon.pokemonId];
  }

  getEvolutions(pokemon: PokemonItem): PokemonItem[] {
    let evolutions: PokemonItem[] = [];
    this.evolutionChain[pokemon.pokemonId].forEach(evolutionId => {
      const evolution = this.pokemonService.getPokemonById(evolutionId);

      if (evolution) {
        evolutions.push(evolution);
      }
    })
    return evolutions;
  }
}
