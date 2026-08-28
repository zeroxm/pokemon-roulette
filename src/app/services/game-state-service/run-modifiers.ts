import { PokemonItem } from '../../interfaces/pokemon-item';

/**
 * Game rules that span a whole run rather than a single state.
 *
 * These used to live as fields on `RouletteContainerComponent`, which is never destroyed — no
 * `@if` guards it — so restarting reset the services but left these behind. A pending mega-stone
 * award could then swallow the *next* run's first evolution, and a stolen Pokémon could be
 * recovered in a game it was never stolen in.
 *
 * They belong beside `currentRound`, which is already run-scoped, so one reset clears everything.
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
  /** Whether Mimikyu's Disguise has already absorbed a defeat. Once per run. */
  disguiseUsed: boolean;
}

export const initialRunModifiers = (): RunModifiers => ({
  evolutionCredits: 0,
  expShareUsed: false,
  expSharePokemon: null,
  runningShoesUsed: false,
  stolenPokemon: null,
  disguiseUsed: false,
});
