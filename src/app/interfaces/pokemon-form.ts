import { WheelItem } from './wheel-item';
import { PokemonType } from './pokemon-type';

export interface PokemonForm extends WheelItem {
  pokemonId: number;
  type1: PokemonType;
  type2: PokemonType | null;
}
