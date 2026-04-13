export type PokemonType =
  | 'normal'
  | 'fighting'
  | 'flying'
  | 'poison'
  | 'ground'
  | 'rock'
  | 'bug'
  | 'ghost'
  | 'steel'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'psychic'
  | 'ice'
  | 'dragon'
  | 'dark'
  | 'fairy';

export interface PokemonTypeData {
  id: number;
  key: PokemonType;
}

export const pokemonTypeData: PokemonTypeData[] = [
  { id: 1, key: 'normal' },
  { id: 2, key: 'fighting' },
  { id: 3, key: 'flying' },
  { id: 4, key: 'poison' },
  { id: 5, key: 'ground' },
  { id: 6, key: 'rock' },
  { id: 7, key: 'bug' },
  { id: 8, key: 'ghost' },
  { id: 9, key: 'steel' },
  { id: 10, key: 'fire' },
  { id: 11, key: 'water' },
  { id: 12, key: 'grass' },
  { id: 13, key: 'electric' },
  { id: 14, key: 'psychic' },
  { id: 15, key: 'ice' },
  { id: 16, key: 'dragon' },
  { id: 17, key: 'dark' },
  { id: 18, key: 'fairy' }
];

export const pokemonTypeDataByKey: Record<PokemonType, PokemonTypeData> = pokemonTypeData.reduce((acc, typeData) => {
  acc[typeData.key] = typeData;
  return acc;
}, {} as Record<PokemonType, PokemonTypeData>);