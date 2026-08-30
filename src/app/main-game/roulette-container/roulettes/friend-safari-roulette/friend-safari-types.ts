import { PokemonType, pokemonTypeData } from '../../../../interfaces/pokemon-type';
import { WheelItem } from '../../../../interfaces/wheel-item';

/**
 * Wheel colour per type: the series' palette taken down to 55% brightness, so a slice is
 * recognisable before its label is read.
 *
 * The darkening is not decorative. `WheelComponent` draws slice labels in white, and the palette at
 * full brightness leaves Electric and Ice around 0.8 luminance — barely legible. At this shade every
 * type clears 4.5:1 against white.
 *
 * Kept here rather than on `PokemonTypeData`, which describes the API's numeric ids and has no
 * presentation concerns.
 */
const TYPE_COLOURS: Record<PokemonType, string> = {
  normal: '#5C5C43',
  fighting: '#6B1916',
  flying: '#5D4F86',
  poison: '#5A2259',
  ground: '#7C6938',
  rock: '#64591E',
  bug: '#5B660E',
  ghost: '#3F3053',
  steel: '#656571',
  fire: '#83471A',
  water: '#364F84',
  grass: '#436D2A',
  electric: '#887218',
  psychic: '#892F4A',
  ice: '#537776',
  dragon: '#3D1D8B',
  dark: '#3E3027',
  fairy: '#76495F',
};

/** A type slice, carrying the type it stands for so dispatch never depends on wheel order. */
export interface FriendSafariTypeItem extends WheelItem {
  readonly type: PokemonType;
}

/**
 * All eighteen types, in the series' canonical order.
 *
 * Derived from `pokemonTypeData` rather than re-listed, so a type cannot exist in one place and not
 * the other.
 */
export const FRIEND_SAFARI_TYPES: readonly FriendSafariTypeItem[] = pokemonTypeData.map(({ key }) => ({
  type: key,
  text: `types.${key}`,
  fillStyle: TYPE_COLOURS[key],
  weight: 1,
}));
