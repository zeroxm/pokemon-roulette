import { SyncSnapshot, mergeSnapshots } from '../services/sync-service/sync-snapshot';
import { GameSettings } from '../services/settings-service/settings.service';
import { PokedexEntry } from '../services/pokedex-service/pokedex.service';
import { HandoffPayload, LegacyEntry, decodeHandoff } from './handoff-payload';

/** The fragment key the old origin redirects with. */
const FRAGMENT_KEY = 'migrate';

const POKEDEX_KEY = 'pokemon-roulette-pokedex';
const SETTINGS_KEY = 'pokemon-roulette-settings';
const THEME_KEY = 'pokemon-roulette-theme';
const LANGUAGE_KEY = 'language';

export interface ImportResult {
  /** How many Pokémon arrived, for telling the player something true. */
  pokemon: number;
  settings: boolean;
}

/**
 * Takes a collection handed over by the old origin, if one is in the URL.
 *
 * **Runs before Angular bootstraps**, from `main.ts`. Every service reads its
 * slice of `localStorage` in its constructor, so an import that ran after
 * bootstrap would be writing underneath services that had already decided the
 * Pokédex was empty.
 *
 * Returns `null` when there is nothing to do, which is the overwhelmingly
 * common case — every ordinary page load takes this path.
 */
export function importHandoff(
  storage: Storage = localStorage,
  location: Location = window.location,
  history: History = window.history,
): ImportResult | null {
  const encoded = readFragment(location.hash);
  if (!encoded) {
    return null;
  }

  // Scrub first, and unconditionally. A collection in the address bar is
  // something a player can paste into a chat window without ever realising,
  // and a reload that re-imports is a confusing way to discover that.
  scrub(location, history);

  const payload = decodeHandoff(encoded);
  if (!payload) {
    console.warn('Ignoring an unreadable progress transfer.');
    return null;
  }

  try {
    return apply(payload, storage);
  } catch (error) {
    // Nothing here may cost a player the collection they already have. A
    // failed transfer leaves them exactly as they were, on a working game.
    console.error('Failed to import transferred progress:', error);
    return null;
  }
}

function apply(payload: HandoffPayload, storage: Storage): ImportResult {
  const incoming = toSnapshot(payload.pokedex, payload.settings);
  const local = toSnapshot(readPokedex(storage), readJson(storage, SETTINGS_KEY));

  // Argument order is the whole rule for settings: the *second* snapshot wins
  // them. Passing local second means an existing preference survives, so a
  // stale bookmark opened months later cannot reset choices made since. Every
  // other collection is grow-only and merges the same either way.
  const merged = mergeSnapshots(incoming, local);

  const caught: Record<string, PokedexEntry> = {};
  for (const [id, entry] of Object.entries(merged.pokedex)) {
    caught[id] = { won: entry.won, shiny: entry.shiny, mega: entry.mega, count: entry.count };
  }
  storage.setItem(POKEDEX_KEY, JSON.stringify({ caught }));

  // Preferences transfer only into an empty seat, for the same reason.
  const settingsTransferred = merged.settings !== null && local.settings === null;
  if (settingsTransferred) {
    storage.setItem(SETTINGS_KEY, JSON.stringify(merged.settings));
  }
  copyIfAbsent(storage, THEME_KEY, payload.theme);
  copyIfAbsent(storage, LANGUAGE_KEY, payload.language);

  return { pokemon: Object.keys(caught).length, settings: settingsTransferred };
}

/**
 * Both sides of the merge, in the sync client's own shape.
 *
 * Reusing `mergeSnapshots` rather than writing a second union is the point:
 * the rules that decide whether a shiny survives are then defined once, and a
 * player transferring gets exactly what a player syncing gets.
 */
function toSnapshot(
  // `count` is absent from anything the old origin wrote and present in
  // anything this one did, and both sides go through here.
  pokedex: Record<string, LegacyEntry & { count?: number }>,
  settings: Record<string, unknown> | null,
): SyncSnapshot {
  const entries: SyncSnapshot['pokedex'] = {};
  for (const [id, entry] of Object.entries(pokedex)) {
    entries[id] = {
      won: Boolean(entry?.won),
      shiny: Boolean(entry?.shiny),
      mega: Boolean(entry?.mega),
      // The old build never counted catches. One is the floor and the truth:
      // an entry exists because the Pokémon was obtained at least once.
      count: typeof entry?.count === 'number' && entry.count > 0 ? entry.count : 1,
    };
  }

  return {
    pokedex: entries,
    badges: [],
    achievements: {},
    counters: {},
    settings: settings as Partial<GameSettings> | null,
  };
}

function readFragment(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const value = params.get(FRAGMENT_KEY);
  return value && value.length > 0 ? value : null;
}

function scrub(location: Location, history: History): void {
  history.replaceState(null, '', location.pathname + location.search);
}

function readPokedex(storage: Storage): Record<string, LegacyEntry & { count?: number }> {
  const stored = readJson(storage, POKEDEX_KEY);
  const caught = stored?.['caught'];
  return typeof caught === 'object' && caught !== null
    ? (caught as Record<string, LegacyEntry & { count?: number }>)
    : {};
}

function readJson(storage: Storage, key: string): Record<string, unknown> | null {
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function copyIfAbsent(storage: Storage, key: string, value: string | null): void {
  if (value !== null && storage.getItem(key) === null) {
    storage.setItem(key, value);
  }
}
