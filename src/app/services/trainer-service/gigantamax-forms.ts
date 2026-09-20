import { PokemonItem } from '../../interfaces/pokemon-item';
import { nationalDexPokemon } from '../pokemon-service/national-dex-pokemon';

/**
 * Gigantamax forms, keyed by the form the Pokemon is **currently** in.
 *
 * Keyed on the current id rather than the species because two species have a Gigantamax per base
 * form: Toxtricity Amped (849) and Low Key (10184), Urshifu Single Strike (892) and Rapid Strike
 * (10191). Keying this way makes "the Gigantamax matching the form the player caught" a lookup
 * instead of a search with a fallback, and makes the wrong pairing unrepresentable.
 *
 * Eternatus is here as Eternamax. Not a Gigantamax in the games, but it is Galar's box legendary
 * and the transformation is the same beat.
 *
 * Replaces `pokemon-forms-gigantamax.json`, which was never imported anywhere and could not be:
 * it had no sprite, shiny or power, and its `text` held display strings rather than i18n keys.
 */

const basePowerById = new Map(nationalDexPokemon.map(pokemon => [pokemon.pokemonId, pokemon.power]));

/**
 * The species' own power, derived rather than copied.
 *
 * Gigantamax must not change power. `carryOver` reads `power` from the target form, so a literal
 * that drifted from the Dex would quietly move the battle odds *on top of* the +3 winning slices a
 * Gigantamax already grants, and nothing on screen would explain it. The extra slices are the buff;
 * the sprite is theatre. Same reasoning as Mimikyu's Disguise, where both forms carry power 2.
 */
function powerOf(speciesId: number): PokemonItem['power'] {
  const power = basePowerById.get(speciesId);
  if (power === undefined) {
    throw new Error(`gigantamax-forms: no National Dex entry for species ${speciesId}`);
  }
  return power;
}

export const gigantamaxForms: Record<number, PokemonItem> = {
  3: {
    text: 'pokemon.venusaur-gmax',
    pokemonId: 10195,
    fillStyle: 'green',
    type1: 'grass',
    type2: 'poison',
    sprite: null,
    shiny: false,
    power: powerOf(3),
    weight: 1
  },
  6: {
    text: 'pokemon.charizard-gmax',
    pokemonId: 10196,
    fillStyle: 'red',
    type1: 'fire',
    type2: 'flying',
    sprite: null,
    shiny: false,
    power: powerOf(6),
    weight: 1
  },
  9: {
    text: 'pokemon.blastoise-gmax',
    pokemonId: 10197,
    fillStyle: 'blue',
    type1: 'water',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(9),
    weight: 1
  },
  12: {
    text: 'pokemon.butterfree-gmax',
    pokemonId: 10198,
    fillStyle: 'white',
    type1: 'bug',
    type2: 'flying',
    sprite: null,
    shiny: false,
    power: powerOf(12),
    weight: 1
  },
  25: {
    text: 'pokemon.pikachu-gmax',
    pokemonId: 10199,
    fillStyle: 'yellow',
    type1: 'electric',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(25),
    weight: 1
  },
  52: {
    text: 'pokemon.meowth-gmax',
    pokemonId: 10200,
    fillStyle: 'yellow',
    type1: 'normal',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(52),
    weight: 1
  },
  68: {
    text: 'pokemon.machamp-gmax',
    pokemonId: 10201,
    fillStyle: 'gray',
    type1: 'fighting',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(68),
    weight: 1
  },
  94: {
    text: 'pokemon.gengar-gmax',
    pokemonId: 10202,
    fillStyle: 'purple',
    type1: 'ghost',
    type2: 'poison',
    sprite: null,
    shiny: false,
    power: powerOf(94),
    weight: 1
  },
  99: {
    text: 'pokemon.kingler-gmax',
    pokemonId: 10203,
    fillStyle: 'red',
    type1: 'water',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(99),
    weight: 1
  },
  131: {
    text: 'pokemon.lapras-gmax',
    pokemonId: 10204,
    fillStyle: 'blue',
    type1: 'water',
    type2: 'ice',
    sprite: null,
    shiny: false,
    power: powerOf(131),
    weight: 1
  },
  133: {
    text: 'pokemon.eevee-gmax',
    pokemonId: 10205,
    fillStyle: 'brown',
    type1: 'normal',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(133),
    weight: 1
  },
  143: {
    text: 'pokemon.snorlax-gmax',
    pokemonId: 10206,
    fillStyle: 'black',
    type1: 'normal',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(143),
    weight: 1
  },
  569: {
    text: 'pokemon.garbodor-gmax',
    pokemonId: 10207,
    fillStyle: 'green',
    type1: 'poison',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(569),
    weight: 1
  },
  809: {
    text: 'pokemon.melmetal-gmax',
    pokemonId: 10208,
    fillStyle: 'gray',
    type1: 'steel',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(809),
    weight: 1
  },
  812: {
    text: 'pokemon.rillaboom-gmax',
    pokemonId: 10209,
    fillStyle: 'green',
    type1: 'grass',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(812),
    weight: 1
  },
  815: {
    text: 'pokemon.cinderace-gmax',
    pokemonId: 10210,
    fillStyle: 'white',
    type1: 'fire',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(815),
    weight: 1
  },
  818: {
    text: 'pokemon.inteleon-gmax',
    pokemonId: 10211,
    fillStyle: 'blue',
    type1: 'water',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(818),
    weight: 1
  },
  823: {
    text: 'pokemon.corviknight-gmax',
    pokemonId: 10212,
    fillStyle: 'purple',
    type1: 'flying',
    type2: 'steel',
    sprite: null,
    shiny: false,
    power: powerOf(823),
    weight: 1
  },
  826: {
    text: 'pokemon.orbeetle-gmax',
    pokemonId: 10213,
    fillStyle: 'red',
    type1: 'bug',
    type2: 'psychic',
    sprite: null,
    shiny: false,
    power: powerOf(826),
    weight: 1
  },
  834: {
    text: 'pokemon.drednaw-gmax',
    pokemonId: 10214,
    fillStyle: 'green',
    type1: 'water',
    type2: 'rock',
    sprite: null,
    shiny: false,
    power: powerOf(834),
    weight: 1
  },
  839: {
    text: 'pokemon.coalossal-gmax',
    pokemonId: 10215,
    fillStyle: 'black',
    type1: 'rock',
    type2: 'fire',
    sprite: null,
    shiny: false,
    power: powerOf(839),
    weight: 1
  },
  841: {
    text: 'pokemon.flapple-gmax',
    pokemonId: 10216,
    fillStyle: 'green',
    type1: 'grass',
    type2: 'dragon',
    sprite: null,
    shiny: false,
    power: powerOf(841),
    weight: 1
  },
  842: {
    text: 'pokemon.appletun-gmax',
    pokemonId: 10217,
    fillStyle: 'green',
    type1: 'grass',
    type2: 'dragon',
    sprite: null,
    shiny: false,
    power: powerOf(842),
    weight: 1
  },
  844: {
    text: 'pokemon.sandaconda-gmax',
    pokemonId: 10218,
    fillStyle: 'green',
    type1: 'ground',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(844),
    weight: 1
  },
  849: {
    text: 'pokemon.toxtricity-amped-gmax',
    pokemonId: 10219,
    fillStyle: 'purple',
    type1: 'electric',
    type2: 'poison',
    sprite: null,
    shiny: false,
    power: powerOf(849),
    weight: 1
  },
  851: {
    text: 'pokemon.centiskorch-gmax',
    pokemonId: 10220,
    fillStyle: 'red',
    type1: 'fire',
    type2: 'bug',
    sprite: null,
    shiny: false,
    power: powerOf(851),
    weight: 1
  },
  858: {
    text: 'pokemon.hatterene-gmax',
    pokemonId: 10221,
    fillStyle: 'pink',
    type1: 'psychic',
    type2: 'fairy',
    sprite: null,
    shiny: false,
    power: powerOf(858),
    weight: 1
  },
  861: {
    text: 'pokemon.grimmsnarl-gmax',
    pokemonId: 10222,
    fillStyle: 'purple',
    type1: 'dark',
    type2: 'fairy',
    sprite: null,
    shiny: false,
    power: powerOf(861),
    weight: 1
  },
  869: {
    text: 'pokemon.alcremie-gmax',
    pokemonId: 10223,
    fillStyle: 'white',
    type1: 'fairy',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(869),
    weight: 1
  },
  879: {
    text: 'pokemon.copperajah-gmax',
    pokemonId: 10224,
    fillStyle: 'green',
    type1: 'steel',
    type2: null,
    sprite: null,
    shiny: false,
    power: powerOf(879),
    weight: 1
  },
  884: {
    text: 'pokemon.duraludon-gmax',
    pokemonId: 10225,
    fillStyle: 'white',
    type1: 'steel',
    type2: 'dragon',
    sprite: null,
    shiny: false,
    power: powerOf(884),
    weight: 1
  },
  890: {
    text: 'pokemon.eternatus-eternamax',
    pokemonId: 10190,
    fillStyle: 'purple',
    type1: 'poison',
    type2: 'dragon',
    sprite: null,
    shiny: false,
    power: powerOf(890),
    weight: 1
  },
  892: {
    text: 'pokemon.urshifu-single-strike-gmax',
    pokemonId: 10226,
    fillStyle: 'gray',
    type1: 'fighting',
    type2: 'dark',
    sprite: null,
    shiny: false,
    power: powerOf(892),
    weight: 1
  },
  10184: {  // alternate base form of 849
    text: 'pokemon.toxtricity-low-key-gmax',
    pokemonId: 10228,
    fillStyle: 'purple',
    type1: 'electric',
    type2: 'poison',
    sprite: null,
    shiny: false,
    power: powerOf(849),
    weight: 1
  },
  10191: {  // alternate base form of 892
    text: 'pokemon.urshifu-rapid-strike-gmax',
    pokemonId: 10227,
    fillStyle: 'gray',
    type1: 'fighting',
    type2: 'dark',
    sprite: null,
    shiny: false,
    power: powerOf(892),
    weight: 1
  },
};
