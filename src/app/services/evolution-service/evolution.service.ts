import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { evolutionChain } from './evolution-chain';
import { PokemonService } from '../pokemon-service/pokemon.service';
import { formAliasById } from '../pokemon-forms-service/pokemon-forms';

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
    const evolutions: PokemonItem[] = [];

    this.evolutionChain[pokemon.pokemonId].forEach(evolutionId => {
      const evolution = this.resolveEvolutionPokemon(evolutionId);

      if (evolution) {
        evolutions.push(evolution);
      }
    });

    return evolutions;
  }

  private resolveEvolutionPokemon(evolutionId: number): PokemonItem | undefined {
    if (evolutionId <= 10000) {
      return this.pokemonService.getPokemonById(evolutionId);
    }

    const alias = formAliasById[evolutionId];

    if (!alias) {
      return undefined;
    }

    const basePokemon = this.pokemonService.getPokemonById(alias.baseId);

    if (!basePokemon) {
      return undefined;
    }

    const formPokemon = structuredClone(basePokemon);
    formPokemon.pokemonId = alias.form.pokemonId;
    formPokemon.text = alias.form.text;
    formPokemon.fillStyle = alias.form.fillStyle;
    formPokemon.weight = alias.form.weight;
    formPokemon.sprite = null;

    return formPokemon;
  }
}
