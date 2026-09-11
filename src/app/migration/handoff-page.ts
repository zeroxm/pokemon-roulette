import { LegacyEntry, encodeHandoff } from './handoff-payload';

/**
 * The page that permanently replaces the game at `zeroxm.github.io/pokemon-roulette/`.
 *
 * It has one job: read what this origin's `localStorage` holds and hand it to
 * the new address in a URL fragment. It is plain DOM on purpose, no Angular,
 * no framework, because it must keep working, unattended, for players who
 * come back years from now, and every dependency is something that can rot.
 *
 * **This page is permanent.** Deleting it, or adding a `CNAME` to the repo
 * (which would make GitHub 301 this URL before any script runs), destroys the
 * only route by which an existing player's collection can ever be recovered.
 */

/**
 * Where the game lives now.
 *
 * Replaced at bundle time by `--define:__NEW_ORIGIN__`, which is how the
 * rehearsal points a real build of this page at a local origin instead. The
 * default is production, so a plain build is the shippable one.
 */
declare const __NEW_ORIGIN__: string | undefined;

const NEW_ORIGIN =
  typeof __NEW_ORIGIN__ === 'string' ? __NEW_ORIGIN__ : 'https://pokemon-roulette.zeroxm.com.br';

export function start(): void {
  const stored = read();
  const count = Object.keys(stored.pokedex).length;

  const found = document.getElementById('found');
  if (found) {
    found.textContent = count > 0
      ? `Found ${count} Pokémon in this browser.`
      : 'No saved progress found in this browser.';
  }

  const transfer = document.getElementById('transfer') as HTMLAnchorElement | null;
  if (transfer) {
    // Nothing to carry means nothing to explain: send them straight on rather
    // than offering to transfer an empty collection, which reads like a wipe.
    transfer.textContent = count > 0 ? 'Transfer my progress' : 'Go to the game';
    transfer.href = count > 0 ? `${NEW_ORIGIN}/#migrate=${encodeHandoff(stored)}` : NEW_ORIGIN;
  }

  const skip = document.getElementById('skip') as HTMLAnchorElement | null;
  if (skip) {
    skip.href = NEW_ORIGIN;
    // Never trap anyone behind the button. Some players will not want to, and
    // the data stays here either way: transferring is not a one-time offer.
    skip.hidden = count === 0;
  }
}

function read(): { pokedex: Record<string, LegacyEntry>; settings: Record<string, unknown> | null; theme: string | null; language: string | null } {
  return {
    pokedex: readPokedex(),
    settings: readJson('pokemon-roulette-settings'),
    theme: localStorage.getItem('pokemon-roulette-theme'),
    language: localStorage.getItem('language'),
  };
}

function readPokedex(): Record<string, LegacyEntry> {
  const caught = readJson('pokemon-roulette-pokedex')?.['caught'];
  return typeof caught === 'object' && caught !== null ? (caught as Record<string, LegacyEntry>) : {};
}

function readJson(key: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

start();
