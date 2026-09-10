import { GameSettings } from '../settings-service/settings.service';

/**
 * A player's whole collection, in the shape the API speaks.
 *
 * Pure data and pure functions, with no Angular in sight, because the merge
 * rules *are* the product here: the HTTP around them is a thin shell, and a
 * wrong rule loses a Pokédex in a way nobody notices until someone reports
 * their shinies vanished. The contract is `docs/sync.md` in the backend repo.
 *
 * Kept separate from the sync client so the one-time migration off the old
 * origin (#59) can merge a handed-over snapshot with exactly these rules,
 * rather than with a second implementation that drifts.
 */

/** No `sprite`: the URL is derived from the id, on both sides. */
export interface SyncPokedexEntry {
  won: boolean;
  shiny: boolean;
  mega: boolean;
  count: number;
}

export interface SyncSnapshot {
  pokedex: Record<string, SyncPokedexEntry>;
  badges: string[];
  /** Achievement id to ISO 8601 unlock time. */
  achievements: Record<string, string>;
  counters: Record<string, number>;
  /**
   * `null` for a player who has never changed one, and `Partial` because the
   * server stores settings as an opaque blob it does not validate — a payload
   * written by another build may be missing a field this one expects.
   * `SettingsService.adopt` fills the gaps from defaults.
   */
  settings: Partial<GameSettings> | null;
}

export const EMPTY_SNAPSHOT: SyncSnapshot = {
  pokedex: {},
  badges: [],
  achievements: {},
  counters: {},
  settings: null,
};

/**
 * Unions two snapshots. **No rule here may ever decrease a value** — that is
 * the single property that makes syncing safe without locks or vector clocks.
 *
 * `incoming` is the *newer* side, and the only thing that means is which
 * settings win; every other collection is grow-only and therefore order
 * independent. `merge(a, b)` and `merge(b, a)` agree on everything except
 * settings, and there is a test pinning that.
 */
export function mergeSnapshots(base: SyncSnapshot, incoming: SyncSnapshot): SyncSnapshot {
  return {
    pokedex: mergePokedex(base.pokedex, incoming.pokedex),
    badges: [...new Set([...base.badges, ...incoming.badges])].sort(),
    achievements: mergeAchievements(base.achievements, incoming.achievements),
    counters: mergeCounters(base.counters, incoming.counters),
    // Last-write-wins, and the only rule here that can lose a change. Tolerable
    // only because a setting is trivial to re-toggle; nothing expensive to lose
    // may ever be stored this way.
    settings: incoming.settings ?? base.settings,
  };
}

/**
 * Field-wise OR, count by max.
 *
 * A client sending `false` never clears anything: a phone that has not seen
 * your desktop's shiny Charizard sends `shiny: false`, and the shiny survives.
 */
function mergePokedex(
  base: Record<string, SyncPokedexEntry>,
  incoming: Record<string, SyncPokedexEntry>,
): Record<string, SyncPokedexEntry> {
  const merged: Record<string, SyncPokedexEntry> = { ...base };

  for (const [id, entry] of Object.entries(incoming)) {
    const existing = merged[id];
    merged[id] = existing
      ? {
          won: existing.won || entry.won,
          shiny: existing.shiny || entry.shiny,
          mega: existing.mega || entry.mega,
          count: Math.max(existing.count, entry.count),
        }
      : entry;
  }

  return merged;
}

/**
 * Union, earliest timestamp wins.
 *
 * Earliest rather than latest because the stored time is when the player
 * *earned* it, and syncing to a new device must not restamp a two-year-old
 * unlock as today's.
 */
function mergeAchievements(
  base: Record<string, string>,
  incoming: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = { ...base };

  for (const [id, at] of Object.entries(incoming)) {
    const existing = merged[id];
    merged[id] = existing && existing <= at ? existing : at;
  }

  return merged;
}

/** Max, never lower. Two devices offline at once under-count; that trade is in `docs/sync.md`. */
function mergeCounters(
  base: Record<string, number>,
  incoming: Record<string, number>,
): Record<string, number> {
  const merged: Record<string, number> = { ...base };

  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = Math.max(merged[key] ?? 0, value);
  }

  return merged;
}

/**
 * Reads a server response into a snapshot, keeping only what is well formed.
 *
 * Tolerant on purpose. The game deploys on every push to `main` and the API
 * does not, so a response carrying a field this build has never heard of is
 * the normal case rather than an error — and refusing to parse one would
 * strand a player's collection on the server.
 */
export function parseSyncSnapshot(body: unknown): SyncSnapshot {
  const source = isObject(body) ? body : {};

  return {
    pokedex: parsePokedex(source['pokedex']),
    badges: Array.isArray(source['badges'])
      ? source['badges'].filter((id): id is string => typeof id === 'string')
      : [],
    achievements: parseStringMap(source['achievements']),
    counters: parseCounters(source['counters']),
    settings: isObject(source['settings']) ? (source['settings'] as Partial<GameSettings>) : null,
  };
}

function parsePokedex(value: unknown): Record<string, SyncPokedexEntry> {
  if (!isObject(value)) {
    return {};
  }

  const entries: Record<string, SyncPokedexEntry> = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!isObject(entry)) {
      continue;
    }

    // A row exists because the Pokémon was obtained at least once, so 1 is the
    // floor and 0 is never meaningful.
    const count = typeof entry['count'] === 'number' && entry['count'] > 0 ? Math.floor(entry['count']) : 1;

    entries[id] = {
      won: entry['won'] === true,
      shiny: entry['shiny'] === true,
      mega: entry['mega'] === true,
      count,
    };
  }

  return entries;
}

function parseStringMap(value: unknown): Record<string, string> {
  if (!isObject(value)) {
    return {};
  }

  const map: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      map[key] = item;
    }
  }

  return map;
}

function parseCounters(value: unknown): Record<string, number> {
  if (!isObject(value)) {
    return {};
  }

  const counters: Record<string, number> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'number' && Number.isFinite(item) && item > 0) {
      counters[key] = Math.floor(item);
    }
  }

  return counters;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
