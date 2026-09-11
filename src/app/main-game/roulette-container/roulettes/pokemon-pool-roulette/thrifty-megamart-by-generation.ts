/**
 * The Abandoned Thrifty Megamart catch pool.
 *
 * An Alolan supermarket left to rot, and the one place in Sun/Moon a player
 * meets Mimikyu. It exists here for that reason: "It's a Disguise!" asks you
 * to break Mimikyu's Disguise, and until now there was no way to obtain a
 * Mimikyu at all, so the achievement was unreachable rather than hard.
 *
 * Only generation 7 has one, so this is deliberately a one-key table — the
 * slice that leads here is itself gated to Alola.
 */
export const thriftyMegamartByGeneration: Record<number, number[]> = {
  7: [
    92,  // Gastly
    93,  // Haunter
    707, // Klefki
    778, // Mimikyu
  ],
};

/**
 * Mimikyu is three times as likely as anything else on the shelf.
 *
 * It is the reason to come here, and a flat quarter chance would make the
 * achievement behind it a grind against a wheel rather than a thing you set
 * out to do.
 */
export const thriftyMegamartFeaturedIds: readonly number[] = [778];
