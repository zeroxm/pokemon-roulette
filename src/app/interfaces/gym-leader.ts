import { PokemonType } from './pokemon-type';

export interface GymLeader{
  name: string;
  sprite: string | string[];
  quotes: string[];
  types?: PokemonType[];
}