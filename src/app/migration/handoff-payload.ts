/**
 * The format the old origin hands a collection to the new one in.
 *
 * `localStorage` is scoped to an origin, so a player's Pokédex at
 * `zeroxm.github.io` is invisible from `pokemon-roulette.zeroxm.com.br`. The
 * only way across is first-party JavaScript on the old origin putting the data
 * in a URL fragment: fragments are never sent to a server, so nothing lands
 * in anybody's access log.
 *
 * **This module is the single definition of that format**, imported by both
 * sides: the page deployed to the old origin encodes with it, and the game
 * decodes with it. Two implementations of one wire format is how a migration
 * quietly corrupts collections, and the format has to keep working for players
 * who return years from now.
 */

/** Highest National Dex id the game knows. Ids above it are alternate forms. */
const DEX_MAX = 1025;

const PRESENT = 1;
const WON = 2;
const SHINY = 4;
const MEGA = 8;

/** What a Pokédex entry looked like on the old origin, before counts existed. */
export interface LegacyEntry {
  won?: boolean;
  shiny?: boolean;
  mega?: boolean;
  /** A ~90-character URL, dropped on the way across: it is derived from the id. */
  sprite?: string | null;
}

/** The four keys the old build ever wrote. There is nothing else to carry. */
export interface LegacyStorage {
  pokedex: Record<string, LegacyEntry>;
  settings: Record<string, unknown> | null;
  theme: string | null;
  language: string | null;
}

export interface HandoffPayload extends LegacyStorage {
  v: number;
}

/**
 * Packs a collection into a fragment-safe string.
 *
 * The dense range is four bits per Pokémon rather than JSON. A full Pokédex as
 * JSON is roughly 40 KB, which base64 inflates to 55 KB: inside what browsers
 * accept, but not by a margin worth betting a player's collection on. Four bits
 * across 1025 ids is **513 bytes**, about 700 base64 characters, which no limit
 * anywhere is going to argue with.
 */
export function encodeHandoff(source: LegacyStorage): string {
  const packed = new Uint8Array(Math.ceil((DEX_MAX * 4) / 8));
  const extra: [number, number][] = [];

  for (const [key, entry] of Object.entries(source.pokedex ?? {})) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1) {
      continue;
    }

    const flags = PRESENT
      | (entry?.won ? WON : 0)
      | (entry?.shiny ? SHINY : 0)
      | (entry?.mega ? MEGA : 0);

    // Alternate forms live at ids like 10034, far outside the dense range, and
    // the game genuinely stores them: `registerInPokedex` writes the form id
    // as well as the base species. A fixed-width array alone would drop every
    // mega and every Ogerpon mask a player owns, silently, which is the exact
    // failure this whole migration exists to avoid.
    if (id > DEX_MAX) {
      extra.push([id, flags]);
      continue;
    }

    const offset = id - 1;
    const index = offset >> 1;
    packed[index] |= offset % 2 === 0 ? flags : flags << 4;
  }

  return toBase64Url(
    JSON.stringify({
      v: 1,
      dex: bytesToBase64Url(packed),
      ext: extra,
      settings: source.settings ?? null,
      theme: source.theme ?? null,
      language: source.language ?? null,
    }),
  );
}

/**
 * Reads a fragment back.
 *
 * Returns `null` for anything it cannot make sense of. A player arriving with
 * a truncated or hand-edited fragment must land in a working game with their
 * existing data untouched, not on an error: they have no idea what a fragment
 * is, and nothing they did caused it.
 */
export function decodeHandoff(encoded: string): HandoffPayload | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (!isObject(parsed) || parsed['v'] !== 1) {
      return null;
    }

    const packed = base64UrlToBytes(String(parsed['dex'] ?? ''));
    const pokedex: Record<string, LegacyEntry> = {};

    for (let id = 1; id <= DEX_MAX; id++) {
      const offset = id - 1;
      const byte = packed[offset >> 1] ?? 0;
      const flags = offset % 2 === 0 ? byte & 0x0f : byte >> 4;
      if (flags & PRESENT) {
        pokedex[String(id)] = entryFromFlags(flags);
      }
    }

    for (const pair of Array.isArray(parsed['ext']) ? parsed['ext'] : []) {
      if (Array.isArray(pair) && typeof pair[0] === 'number' && typeof pair[1] === 'number') {
        pokedex[String(pair[0])] = entryFromFlags(pair[1]);
      }
    }

    return {
      v: 1,
      pokedex,
      settings: isObject(parsed['settings']) ? parsed['settings'] : null,
      theme: typeof parsed['theme'] === 'string' ? parsed['theme'] : null,
      language: typeof parsed['language'] === 'string' ? parsed['language'] : null,
    };
  } catch {
    return null;
  }
}

function entryFromFlags(flags: number): LegacyEntry {
  return {
    won: Boolean(flags & WON),
    shiny: Boolean(flags & SHINY),
    mega: Boolean(flags & MEGA),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Base64url, unpadded: `+/=` are all awkward in a URL, and `=` is often stripped in transit. */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64Url(bytes);
}

function fromBase64Url(encoded: string): string {
  return new TextDecoder().decode(base64UrlToBytes(encoded));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
