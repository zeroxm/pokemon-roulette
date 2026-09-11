/**
 * What waits on the other side of each Ultra Wormhole.
 *
 * From Ultra Sun and Ultra Moon, cross-checked against Serebii and Bulbapedia.
 * **The colours are places, not types** — blue is a waterfall, red a cliff,
 * green a plains, yellow a cave — which is why red holds both Articuno and
 * Cresselia, and blue both Kyogre and Azelf. Grouping them by type would look
 * tidier and would be wrong.
 *
 * Three deliberate departures from the games, all agreed with André:
 *
 *  - **Version exclusives are all included.** Half of these are Ultra Sun or
 *    Ultra Moon only. One game, one wheel, no reason to withhold half.
 *  - **Party conditions are dropped.** Suicune, Rayquaza, Kyurem, Landorus
 *    and Giratina need specific Pokémon in the party to appear; we have no
 *    such mechanic.
 *  - **The ordinary Pokémon are left out.** Each colour also has five
 *    non-legendaries; a wormhole here is meant to be worth the slice.
 *
 * The white wormhole holds the Ultra Beasts. The games only offer the first
 * seven this way — Stakataka and Blacephalon are story encounters on Mahalo
 * Trail — but they are here too, so the set is the one a player expects.
 */
export type WormholeColour = 'white' | 'red' | 'blue' | 'green' | 'yellow';

export const ULTRA_WORMHOLE_POKEMON: Record<WormholeColour, readonly number[]> = {
  white: [
    793, // Nihilego
    794, // Buzzwole
    795, // Pheromosa
    796, // Xurkitree
    797, // Celesteela
    798, // Kartana
    799, // Guzzlord
    805, // Stakataka
    806, // Blacephalon
  ],
  red: [
    144, // Articuno
    145, // Zapdos
    146, // Moltres
    250, // Ho-Oh
    384, // Rayquaza
    488, // Cresselia
    641, // Tornadus
    642, // Thundurus
    645, // Landorus
    717, // Yveltal
  ],
  blue: [
    245, // Suicune
    249, // Lugia
    380, // Latias
    381, // Latios
    382, // Kyogre
    480, // Uxie
    481, // Mesprit
    482, // Azelf
    646, // Kyurem
  ],
  green: [
    150, // Mewtwo
    243, // Raikou
    244, // Entei
    483, // Dialga
    638, // Cobalion
    639, // Terrakion
    640, // Virizion
    643, // Reshiram
    644, // Zekrom
    716, // Xerneas
  ],
  yellow: [
    377, // Regirock
    378, // Regice
    379, // Registeel
    383, // Groudon
    484, // Palkia
    485, // Heatran
    486, // Regigigas
    487, // Giratina
  ],
};

export interface WormholeColourItem {
  readonly colour: WormholeColour;
  readonly text: string;
  readonly fillStyle: string;
  readonly weight: number;
}

/** The wheel itself. Even odds: no colour is rarer than another here. */
export const WORMHOLE_COLOURS: readonly WormholeColourItem[] = [
  { colour: 'white', text: 'game.main.roulette.ultraWormhole.colours.white', fillStyle: '#e8e8e8', weight: 1 },
  { colour: 'red', text: 'game.main.roulette.ultraWormhole.colours.red', fillStyle: 'crimson', weight: 1 },
  { colour: 'blue', text: 'game.main.roulette.ultraWormhole.colours.blue', fillStyle: 'royalblue', weight: 1 },
  { colour: 'green', text: 'game.main.roulette.ultraWormhole.colours.green', fillStyle: 'seagreen', weight: 1 },
  { colour: 'yellow', text: 'game.main.roulette.ultraWormhole.colours.yellow', fillStyle: 'goldenrod', weight: 1 },
];
