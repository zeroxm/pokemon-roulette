import { PokemonType, pokemonTypeData } from '../../../../interfaces/pokemon-type';
import { WheelItem } from '../../../../interfaces/wheel-item';

/**
 * Wheel colour per type, using the series' own palette so a slice is recognisable before its label
 * is read. Kept here rather than on `PokemonTypeData`, which describes the API's numeric ids and has
 * no presentation concerns.
 */
const TYPE_COLOURS: Record<PokemonType, string> = {
  normal: '#A8A77A',
  fighting: '#C22E28',
  flying: '#A98FF3',
  poison: '#A33EA1',
  ground: '#E2BF65',
  rock: '#B6A136',
  bug: '#A6B91A',
  ghost: '#735797',
  steel: '#B7B7CE',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  psychic: '#F95587',
  ice: '#96D9D6',
  dragon: '#6F35FC',
  dark: '#705746',
  fairy: '#D685AD',
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
