/**
 * The Max Raid Battle catch pool.
 *
 * A Galar raid den, and the reason it exists: Gigantamax only happens in Galar, but 14 of the 33
 * Gigantamax species were introduced before generation 8, and a Galar run only offers Galar
 * natives. Charizard, Gengar, Machamp, Lapras and Snorlax could therefore never Gigantamax in
 * this game at all, which left their forms as data nothing could reach. Raid dens are exactly
 * where Sword and Shield put those Pokemon, so this is the faithful fix rather than a loophole.
 *
 * Only generation 8 has one, so this is deliberately a one-key table: the slice that leads here
 * is itself gated to Galar.
 *
 * Two rules shape the list, both deliberate:
 *
 * **The Galar starters are absent.** Rillaboom, Cinderace and Inteleon are handed to the player
 * at the start of a Galar run, so putting them in a rare encounter rewards nothing.
 *
 * **Everything with a pre-evolution is given as its pre-evolution**, so the raid is a lead rather
 * than a prize: a Charmeleon still has to find an evolution before it can Gigantamax. Pikachu and
 * Snorlax are the exceptions and arrive as themselves, since Pichu and Munchlax are baby forms
 * rather than a step on the way. Meowth, Lapras, Eevee, Duraludon and Eternatus have no
 * pre-evolution and arrive as themselves for that reason.
 *
 * Applin appears once but covers two Gigantamax forms: it is the pre-evolution of both Flapple
 * and Appletun, and which one it becomes is decided at evolution time. So 30 Gigantamax species
 * are served by 29 slices.
 */
export const maxRaidByGeneration: Record<number, number[]> = {
  8: [
    2,    // Ivysaur      -> Venusaur
    5,    // Charmeleon   -> Charizard
    8,    // Wartortle    -> Blastoise
    11,   // Metapod      -> Butterfree
    25,   // Pikachu      (kept: Pichu is a baby form)
    52,   // Meowth       (no pre-evolution)
    67,   // Machoke      -> Machamp
    93,   // Haunter      -> Gengar
    98,   // Krabby       -> Kingler
    131,  // Lapras       (no pre-evolution)
    133,  // Eevee        (no pre-evolution)
    143,  // Snorlax      (kept: Munchlax is a baby form)
    568,  // Trubbish     -> Garbodor
    808,  // Meltan       -> Melmetal
    822,  // Corvisquire  -> Corviknight
    825,  // Dottler      -> Orbeetle
    833,  // Chewtle      -> Drednaw
    838,  // Carkol       -> Coalossal
    840,  // Applin       -> Flapple OR Appletun
    843,  // Silicobra    -> Sandaconda
    848,  // Toxel        -> Toxtricity, either form
    850,  // Sizzlipede   -> Centiskorch
    857,  // Hattrem      -> Hatterene
    860,  // Morgrem      -> Grimmsnarl
    868,  // Milcery      -> Alcremie
    878,  // Cufant       -> Copperajah
    884,  // Duraludon    (no pre-evolution)
    890,  // Eternatus    (no pre-evolution)
    891,  // Kubfu        -> Urshifu, either style
  ],
};
