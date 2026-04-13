import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonForm } from '../../interfaces/pokemon-form';
import { pokemonForms } from './pokemon-forms';

@Injectable({
  providedIn: 'root'
})
export class PokemonFormsService {

  constructor() {
  }

  private pokemonForms = pokemonForms;

  hasForms(pokemon: PokemonItem): boolean {
    return this.getFormIds(pokemon.pokemonId).length > 1;
  }

  getPokemonForms(pokemon: PokemonItem): PokemonForm[] {
    const basePokemonId = this.getBasePokemonId(pokemon.pokemonId);

    if (basePokemonId === null) {
      return [];
    }

    return this.pokemonForms[basePokemonId].map(pokemonForm => structuredClone(pokemonForm));
  }

  applyFormToPokemon(basePokemon: PokemonItem, pokemonForm: PokemonForm): PokemonItem {
    const selectedPokemon = structuredClone(basePokemon);

    selectedPokemon.pokemonId = pokemonForm.pokemonId;
    selectedPokemon.text = pokemonForm.text;
    selectedPokemon.fillStyle = pokemonForm.fillStyle;
    selectedPokemon.type1 = pokemonForm.type1;
    selectedPokemon.type2 = pokemonForm.type2;
    selectedPokemon.sprite = null;

    return selectedPokemon;
  }

  getFormIds(pokemonId: number): number[] {
    const basePokemonId = this.getBasePokemonId(pokemonId);

    if (basePokemonId === null) {
      return [];
    }

    return this.pokemonForms[basePokemonId]?.map(form => form.pokemonId) ?? [];
  }

  getBasePokemonId(pokemonId: number): number | null {
    if (this.pokemonForms[pokemonId]) {
      return pokemonId;
    }

    for (const [basePokemonId, forms] of Object.entries(this.pokemonForms)) {
      if (forms.some(form => form.pokemonId === pokemonId)) {
        return Number(basePokemonId);
      }
    }

    return null;
  }
}
