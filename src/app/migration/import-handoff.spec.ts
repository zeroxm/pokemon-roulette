import { encodeHandoff } from './handoff-payload';
import { importHandoff } from './import-handoff';

describe('importHandoff', () => {
  let storage: Storage;
  let replaced: string | null;

  const history = {
    replaceState: (_s: unknown, _t: string, url: string) => (replaced = url),
  } as unknown as History;
  const at = (hash: string) => ({ hash, pathname: '/', search: '' }) as Location;

  const fragment = (pokedex: Record<string, { won?: boolean; shiny?: boolean; mega?: boolean }>, rest = {}) =>
    '#migrate=' + encodeHandoff({ pokedex, settings: null, theme: null, language: null, ...rest });

  const pokedex = () => JSON.parse(storage.getItem('pokemon-roulette-pokedex') ?? '{"caught":{}}').caught;

  beforeEach(() => {
    replaced = null;
    localStorage.clear();
    storage = localStorage;
  });

  afterAll(() => localStorage.clear());

  it('does nothing at all on an ordinary page load', () => {
    expect(importHandoff(storage, at(''), history)).toBeNull();
    expect(storage.length).toBe(0);
    expect(replaced).toBeNull();
  });

  it('brings a transferred collection in', () => {
    const result = importHandoff(storage, at(fragment({ '1': { won: true }, '25': { shiny: true } })), history);

    expect(result?.pokemon).toBe(2);
    expect(pokedex()['25']).toEqual({ won: false, shiny: true, mega: false, count: 1 });
  });

  it('merges rather than replaces, and cannot downgrade what is already here', () => {
    storage.setItem('pokemon-roulette-pokedex', JSON.stringify({
      caught: { '6': { won: true, shiny: true, count: 4 } },
    }));

    importHandoff(storage, at(fragment({ '6': { won: false }, '150': { won: true } })), history);

    // The transferred entry says shiny: false. It must not clear the shiny.
    expect(pokedex()['6']).toEqual({ won: true, shiny: true, mega: false, count: 4 });
    expect(pokedex()['150'].won).toBeTrue();
  });

  it('is safe to run twice — a bookmark reopened months later changes nothing', () => {
    const hash = fragment({ '1': { won: true }, '4': { won: true } });

    importHandoff(storage, at(hash), history);
    const first = storage.getItem('pokemon-roulette-pokedex');
    importHandoff(storage, at(hash), history);

    expect(storage.getItem('pokemon-roulette-pokedex')).toBe(first);
  });

  it('transfers settings into an empty seat but never over a newer choice', () => {
    const hash = fragment({}, { settings: { muteAudio: true }, theme: 'light' });

    expect(importHandoff(storage, at(hash), history)?.settings).toBeTrue();
    expect(JSON.parse(storage.getItem('pokemon-roulette-settings')!).muteAudio).toBeTrue();

    // A choice made on the new domain since. Settings are last-write-wins, so
    // a stale transfer arriving second could otherwise undo it.
    storage.setItem('pokemon-roulette-settings', JSON.stringify({ muteAudio: false }));
    storage.setItem('pokemon-roulette-theme', 'dark');

    expect(importHandoff(storage, at(hash), history)?.settings).toBeFalse();
    expect(JSON.parse(storage.getItem('pokemon-roulette-settings')!).muteAudio).toBeFalse();
    expect(storage.getItem('pokemon-roulette-theme')).toBe('dark');
  });

  it('scrubs the collection out of the address bar', () => {
    importHandoff(storage, at(fragment({ '1': { won: true } })), history);
    expect(replaced).toBe('/');
  });

  it('leaves an existing collection untouched when the fragment is garbage', () => {
    storage.setItem('pokemon-roulette-pokedex', JSON.stringify({ caught: { '6': { won: true, count: 2 } } }));

    expect(importHandoff(storage, at('#migrate=wat!!'), history)).toBeNull();

    expect(pokedex()['6'].count).toBe(2);
    // Still scrubbed: a fragment that cannot be read is not one to leave in
    // the address bar for a reload to retry.
    expect(replaced).toBe('/');
  });
});
