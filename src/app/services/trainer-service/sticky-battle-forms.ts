import { PokemonItem } from '../../interfaces/pokemon-item';

export type StickyFormMode = 'toggle' | 'random';

export interface StickyBattleFormGroup {
    mode: StickyFormMode;
    forms: PokemonItem[];
}

export const stickyBattleForms: StickyBattleFormGroup[] = [
    // Aegislash: Shield ↔ Blade
    {
        mode: 'toggle',
        forms: [
            { text: 'pokemon.aegislash-shield', pokemonId: 681,   fillStyle: 'brown',   sprite: null, shiny: false, power: 3, weight: 1 },
            { text: 'pokemon.aegislash-blade',  pokemonId: 10026, fillStyle: 'brown',   sprite: null, shiny: false, power: 3, weight: 1 },
        ],
    },
    // Darmanitan: Standard ↔ Zen
    {
        mode: 'toggle',
        forms: [
            { text: 'pokemon.darmanitan-standard', pokemonId: 555,   fillStyle: 'darkred', sprite: null, shiny: false, power: 3, weight: 1 },
            { text: 'pokemon.darmanitan-zen',      pokemonId: 10017, fillStyle: 'darkred', sprite: null, shiny: false, power: 3, weight: 1 },
        ],
    },
    // Darmanitan Galar: Galar Standard ↔ Galar Zen (independent of normal Darmanitan)
    {
        mode: 'toggle',
        forms: [
            { text: 'pokemon.darmanitan-galar-standard', pokemonId: 10177, fillStyle: 'darkred', sprite: null, shiny: false, power: 3, weight: 1 },
            { text: 'pokemon.darmanitan-galar-zen',      pokemonId: 10178, fillStyle: 'darkred', sprite: null, shiny: false, power: 3, weight: 1 },
        ],
    },
    // Ogerpon: transforms to a random different mask on each battle
    {
        mode: 'random',
        forms: [
            { text: 'pokemon.ogerpon',                  pokemonId: 1017,  fillStyle: 'green', sprite: null, shiny: false, power: 5, weight: 1 },
            { text: 'pokemon.ogerpon-wellspring-mask',  pokemonId: 10273, fillStyle: 'green', sprite: null, shiny: false, power: 5, weight: 1 },
            { text: 'pokemon.ogerpon-hearthflame-mask', pokemonId: 10274, fillStyle: 'green', sprite: null, shiny: false, power: 5, weight: 1 },
            { text: 'pokemon.ogerpon-cornerstone-mask', pokemonId: 10275, fillStyle: 'green', sprite: null, shiny: false, power: 5, weight: 1 },
        ],
    },
];
