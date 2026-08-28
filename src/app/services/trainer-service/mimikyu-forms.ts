import { PokemonItem } from "../../interfaces/pokemon-item";

/**
 * Mimikyu's Disguise.
 *
 * `power` is deliberately identical in both forms. The disguise breaking is a free retry, not a
 * stat change, and `carryOver` takes `power` from the target form — so a different value here
 * would silently shift the battle odds the moment the disguise busts.
 */
export const mimikyuForms: Record<number, PokemonItem[]> = {
    778: [
            { text: "pokemon.mimikyu", pokemonId: 778, fillStyle: "goldenrod", sprite: null, shiny: false, power: 2, weight: 1},
            { text: "pokemon.mimikyu-busted", pokemonId: 10143, fillStyle: "goldenrod", sprite: null, shiny: false, power: 2, weight: 1},
        ]
}
