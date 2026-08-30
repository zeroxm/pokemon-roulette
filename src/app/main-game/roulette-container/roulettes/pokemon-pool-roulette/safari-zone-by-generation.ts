/**
 * The Kanto Safari Zone catch pool.
 *
 * Red/Blue/Yellow and FireRed/LeafGreen encounters, minus the water ones — Psyduck, Poliwag,
 * Slowpoke, Krabby, Goldeen, Magikarp and their evolutions overlap too heavily with the generation
 * 1 fishing wheel to be worth a second appearance here.
 *
 * Only generation 1 has a Safari Zone in this game, so this is deliberately a one-key table: the
 * slice that leads here is itself gated to Kanto.
 */
export const safariZoneByGeneration: Record<number, number[]> = {
  1: [
    29,  // Nidoran♀
    30,  // Nidorina
    32,  // Nidoran♂
    33,  // Nidorino
    46,  // Paras
    47,  // Parasect
    48,  // Venonat
    49,  // Venomoth
    84,  // Doduo
    85,  // Dodrio
    102, // Exeggcute
    104, // Cubone
    105, // Marowak
    111, // Rhyhorn
    113, // Chansey
    114, // Tangela
    115, // Kangaskhan
    123, // Scyther
    127, // Pinsir
    128, // Tauros
    147, // Dratini
    148, // Dragonair
  ],
};

/**
 * The Safari Zone's headline catches — the reason to walk in.
 *
 * Three of them (Kangaskhan, Scyther, Pinsir) have mega forms, and Dratini is the start of a
 * pseudo-legendary line, so landing on one late in a run is worth more than an early Nidoran.
 */
export const safariZonePrizeIds: readonly number[] = [
  113, // Chansey
  115, // Kangaskhan
  123, // Scyther
  127, // Pinsir
  128, // Tauros
  147, // Dratini
  148, // Dragonair
];
