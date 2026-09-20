import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonForm } from '../../interfaces/pokemon-form';
import { pokemonForms } from './pokemon-forms';

/**
 * Species that always arrive in one fixed form instead of being offered a wheel.
 *
 * Zygarde always shows up at 10%: its forms are a ladder it climbs by fighting
 * (`zygarde-forms.ts`), and letting the player pick Complete at catch time would skip the whole
 * mechanic.
 */
const FORCED_CATCH_FORM: Record<number, number> = {
  718: 10181,
};

@Injectable({
  providedIn: 'root'
})
export class PokemonFormsService {

  private pokemonForms = pokemonForms;
  private readonly variantToBase: Map<number, number>;

  constructor() {
    this.variantToBase = new Map<number, number>();
    for (const [baseIdStr, forms] of Object.entries(this.pokemonForms)) {
      const baseId = Number(baseIdStr);
      this.variantToBase.set(baseId, baseId);
      for (const form of forms) {
        this.variantToBase.set(form.pokemonId, baseId);
      }
    }
  }

  hasForms(pokemon: PokemonItem): boolean {
    return this.getFormIds(pokemon.pokemonId).length > 1;
  }

  /**
   * The one form this species is always caught in, or null when the player gets to choose.
   *
   * Returns the form rather than the id so the caller can hand it straight to
   * `applyFormToPokemon` without a second lookup.
   */
  getForcedCatchForm(pokemon: PokemonItem): PokemonForm | null {
    const baseId = this.getBasePokemonId(pokemon.pokemonId);
    if (baseId === null) {
      return null;
    }

    const forcedId = FORCED_CATCH_FORM[baseId];
    if (forcedId === undefined) {
      return null;
    }

    const form = this.pokemonForms[baseId]?.find(candidate => candidate.pokemonId === forcedId);
    return form ? structuredClone(form) : null;
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
    return this.variantToBase.get(pokemonId) ?? null;
  }
}
