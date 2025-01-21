import { WheelItem } from "./wheel-item";

export interface PokemonItem extends WheelItem {
  pokemonId: number;
  sprite: {
    front_default: string;
    front_shiny: string;
  } | null;
  shiny: boolean;
}