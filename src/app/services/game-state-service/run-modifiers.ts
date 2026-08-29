import { PokemonItem } from '../../interfaces/pokemon-item';

/**
 * Game rules that span a whole run rather than a single state.
 *
 * They live here beside `currentRound` rather than on `RouletteContainerComponent`, which is never
 * destroyed — so one reset clears all of them on restart.
 */
export interface RunModifiers {
  /** Guaranteed-evolution counter, incremented on each failed check-evolution roll. */
  evolutionCredits: number;
  /** Whether the exp-share bonus evolution has been spent this turn. */
  expShareUsed: boolean;
  expSharePokemon: PokemonItem | null;
  /** Whether the running-shoes re-spin has been consumed this round. */
  runningShoesUsed: boolean;
  /** Pokémon Team Rocket took, held until it can be recovered. */
  stolenPokemon: PokemonItem | null;
}

export const initialRunModifiers = (): RunModifiers => ({
  evolutionCredits: 0,
  expShareUsed: false,
  expSharePokemon: null,
  runningShoesUsed: false,
  stolenPokemon: null,
});
