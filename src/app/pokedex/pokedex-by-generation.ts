/**
 * Complete national Pokédex ranges per generation.
 * Unlike pokemonByGeneration (roulette pool), this includes ALL Pokémon:
 * legendaries, mythicals, Ultra Beasts, Paradox Pokémon, etc.
 *
 * Used by the Local Dex tab to show the full regional pool.
 */
export const pokedexByGeneration: Record<number, number[]> = {
  1: Array.from({ length: 151 }, (_, i) => i + 1),    // 1–151   (Kanto)
  2: Array.from({ length: 100 }, (_, i) => i + 152),   // 152–251 (Johto)
  3: Array.from({ length: 135 }, (_, i) => i + 252),   // 252–386 (Hoenn)
  4: Array.from({ length: 107 }, (_, i) => i + 387),   // 387–493 (Sinnoh)
  5: Array.from({ length: 156 }, (_, i) => i + 494),   // 494–649 (Unova)
  6: Array.from({ length: 72 },  (_, i) => i + 650),   // 650–721 (Kalos)
  7: Array.from({ length: 88 },  (_, i) => i + 722),   // 722–809 (Alola, incl. Ultra Beasts)
  8: Array.from({ length: 96 },  (_, i) => i + 810),   // 810–905 (Galar, incl. Calyrex line)
  9: Array.from({ length: 120 }, (_, i) => i + 906),   // 906–1025 (Paldea, incl. Paradox Pokémon)
};
