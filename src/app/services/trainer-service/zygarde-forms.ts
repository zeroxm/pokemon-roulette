import { PokemonItem } from '../../interfaces/pokemon-item';

/**
 * Zygarde's cells gather over a run: 10% -> 50% -> Complete, one rung per battle, permanently.
 *
 * A `PokemonItem[]` rather than a `PokemonForm[]` because the powers are the point. `carryOver`
 * reads `power` from the target form, so the ladder *is* the stat gain; `applyFormToPokemon`
 * inherits power from the base Dex row and would flatten all three rungs to 5.
 *
 * Mega Zygarde (10301, power 8) is deliberately absent. It still needs Zygardite and stays
 * temporary like every other mega, and its rule is already keyed on 10120 in `pokemonMegaForms`.
 * That rule was unreachable until this ladder gave the player a way to hold a 10120.
 *
 * Order is the ladder. Do not sort this array.
 */
export const zygardeLadderForms: PokemonItem[] = [
    {
        text: 'pokemon.zygarde-10',
        pokemonId: 10181,
        fillStyle: 'green',
        type1: 'dragon',
        type2: 'ground',
        sprite: null,
        shiny: false,
        power: 5,
        weight: 1
    },
    {
        text: 'pokemon.zygarde-50',
        pokemonId: 718,
        fillStyle: 'green',
        type1: 'dragon',
        type2: 'ground',
        sprite: null,
        shiny: false,
        power: 6,
        weight: 1
    },
    {
        text: 'pokemon.zygarde-complete',
        pokemonId: 10120,
        fillStyle: 'green',
        type1: 'dragon',
        type2: 'ground',
        sprite: null,
        shiny: false,
        power: 7,
        weight: 1
    }
];
