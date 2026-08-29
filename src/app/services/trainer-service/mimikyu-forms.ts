import { PokemonItem } from "../../interfaces/pokemon-item";

/**
 * Mimikyu's Disguise: busted for the duration of a battle, restored when it ends.
 *
 * Two details that are load-bearing:
 *
 * - **`power` is identical in both forms.** `carryOver` takes `power` from the target form, so a
 *   different value would silently shift the win/lose odds the moment the disguise broke. The
 *   disguise buys a retry, not a stat change.
 * - **The busted form names its own artwork.** Every other form table leaves `sprite: null` and lets
 *   the runtime fetch it from PokéAPI, but PokéAPI has no official artwork for 10143 — that field is
 *   literally `null` in the API response, so the fetch "succeeded" and produced no image. These are
 *   the HOME sprites, which do exist, hard-linked like the National Dex entries.
 */
export const mimikyuForms: Record<number, PokemonItem[]> = {
    778: [
            { text: "pokemon.mimikyu", pokemonId: 778, fillStyle: "goldenrod", sprite: null, shiny: false, power: 2, weight: 1},
            {
                text: "pokemon.mimikyu-busted",
                pokemonId: 10143,
                fillStyle: "goldenrod",
                sprite: {
                    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10143.png",
                    front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10143.png"
                },
                shiny: false,
                power: 2,
                weight: 1
            },
        ]
}
