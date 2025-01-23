import { WheelItem } from "./wheel-item";

export interface PokemonItem extends WheelItem {
  pokemonId: number;
  sprite: {
    front_default: string;
    front_shiny: string;
  } | null;
  shiny: boolean;
  power: 1 | 2 | 3 | 4 | 5;
}