/**
 * Lifetime counters the game keeps.
 *
 * These names are the wire format: they are exactly the keys the backend
 * accepts, so a stats blob syncs without translation. The backend rejects
 * anything not on this list, which is what stops a typo becoming a counter
 * that silently never moves.
 *
 * Adding a counter means adding it here *and* to the backend's allowlist.
 * The backend must ship first, or the new key is skipped until it does:
 * skipped, not lost: the client sends absolute state, so it lands on the next
 * sync after the backend learns it.
 */
export const FIXED_COUNTER_KEYS = [
  // A run that reached an end state. **Both endings count** -- beating the
  // champion and reaching the game-over screen. Only wins counted before,
  // which made "Complete 100 runs" mean "win 100 runs" and turned the
  // Dedication achievements into something far harsher than they read.
  'runs_completed',
  'runs_won',
  'spins_total',
  'rival_battles_won',
  'champion_with_six',
  'champion_with_three_or_fewer',
  'mimikyu_disguises_busted',
  'ash_greninja_transformations',
  'sticky_forms_triggered',
  'fishing_catches',
  'fossil_catches',
  'team_rocket_defeats',
  'team_rocket_rescues',
  'eggs_hatched',
  'snorlax_resolved',
  'safari_zone_visits',
  'friend_safari_visits',
  'area_zero_visits',
  'trades_completed',
] as const;

export type FixedCounterKey = typeof FIXED_COUNTER_KEYS[number];

/** Generation ids, as used everywhere else in the game. */
export type GenerationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const GENERATION_IDS: readonly GenerationId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Per-region counters. `champion_region:4` counts how many times Sinnoh has
 * been beaten, so "have I beaten Sinnoh" is `> 0` and "how many regions" is a
 * count of keys above zero.
 *
 * A counter rather than a set because it is genuinely a count, and because it
 * then merges by the same rule as everything else.
 */
export type RegionCounterKey =
  | `champion_region:${GenerationId}`
  | `played_region:${GenerationId}`;

export type CounterKey = FixedCounterKey | RegionCounterKey;

export function championRegionKey(generation: GenerationId): RegionCounterKey {
  return `champion_region:${generation}`;
}

export function playedRegionKey(generation: GenerationId): RegionCounterKey {
  return `played_region:${generation}`;
}

const FIXED = new Set<string>(FIXED_COUNTER_KEYS);
const REGION_KEY = /^(champion_region|played_region):([1-9])$/;

/**
 * Whether a key read back from storage is one this build knows.
 *
 * Unknown keys are dropped rather than kept: a blob written by a *newer* build
 * would otherwise round-trip keys this one cannot reason about, and a typo
 * would live forever.
 */
export function isCounterKey(key: string): key is CounterKey {
  return FIXED.has(key) || REGION_KEY.test(key);
}
