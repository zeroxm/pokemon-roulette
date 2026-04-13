import { PokemonType } from './pokemon-type';

export interface TypeMatchupEntry {
  strongAgainst: PokemonType[];
  weakAgainst: PokemonType[];
}

export type TypeMatchupMap = Record<PokemonType, TypeMatchupEntry>;
