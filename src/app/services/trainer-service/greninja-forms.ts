import { PokemonItem } from "../../interfaces/pokemon-item";

/**
 * Ash-Greninja: a hidden transformation, not a mega evolution.
 *
 * These two entries lived in `pokemonMegaForms` and were provably unreachable — Greninja had three
 * forms against a single stone, joined by array index, so the lookup could only ever return the
 * first. T-24 removed them rather than inventing stones, because Battle Bond is an ability form and
 * has no business in a table the mega-stone lookup walks. This brings the Ash form back on its own
 * terms: it is triggered by using a potion mid-battle, needs no stone, and applies in every region.
 *
 * `power` climbs 3 → 5, matching what the original entry declared and what mega forms grant. Unlike
 * Mimikyu's Disguise — a free retry that deliberately leaves the odds alone — this is meant to be a
 * genuine reward for a battle that went badly enough to need a potion.
 */
export const greninjaForms: Record<number, PokemonItem[]> = {
    658: [
            { text: "pokemon.greninja", pokemonId: 658, fillStyle: "darkblue", type1: "water", type2: "dark", sprite: null, shiny: false, power: 3, weight: 1},
            { text: "pokemon.greninja-ash", pokemonId: 10117, fillStyle: "darkblue", type1: "water", type2: "dark", sprite: null, shiny: false, power: 5, weight: 1},
        ]
}
