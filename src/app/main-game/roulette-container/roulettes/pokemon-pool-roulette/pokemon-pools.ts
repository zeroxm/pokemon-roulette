import { fishByGeneration } from '../fishing-roulette/fish-by-generation';
import { fossilByGeneration } from '../fossil-roulette/fossil-by-generation';
import { legendaryByGeneration } from '../legendary-roulette/legendaries-by-generation';
import { starterByGeneration } from '../starter-roulette/starter-by-generation';
import { cavePokemonByGeneration } from '../cave-pokemon-roulette/cave-pokemon-by-generation';

/**
 * A "pick a Pokémon from this region's set" wheel.
 *
 * Five roulettes were byte-identical apart from a title key and a field name. Rather than a
 * generic wheel taking a magic string, the variance is named data: the shape is `PokemonPool`
 * and the key is a union, so a typo in a template is a compile error.
 */
export interface PokemonPool {
  /** Translation key for the heading. */
  readonly titleKey: string;
  /** Whether the heading names the generation. Starters do not — the region is already implied. */
  readonly showGeneration: boolean;
  readonly idsByGeneration: Record<number, number[]>;
}

export const POKEMON_POOLS = {
  fish: {
    titleKey: 'game.main.roulette.fishing.title',
    showGeneration: true,
    idsByGeneration: fishByGeneration,
  },
  fossil: {
    titleKey: 'game.main.roulette.fossil.which',
    showGeneration: true,
    idsByGeneration: fossilByGeneration,
  },
  legendary: {
    titleKey: 'game.main.roulette.legendary.which',
    showGeneration: true,
    idsByGeneration: legendaryByGeneration,
  },
  starter: {
    titleKey: 'game.main.roulette.starter.title',
    showGeneration: false,
    idsByGeneration: starterByGeneration,
  },
  cave: {
    titleKey: 'game.main.roulette.cave.which',
    showGeneration: true,
    idsByGeneration: cavePokemonByGeneration,
  },
} as const satisfies Record<string, PokemonPool>;

export type PokemonPoolId = keyof typeof POKEMON_POOLS;
