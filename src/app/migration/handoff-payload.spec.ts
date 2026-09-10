import { LegacyStorage, decodeHandoff, encodeHandoff } from './handoff-payload';

function storage(pokedex: LegacyStorage['pokedex'], rest: Partial<LegacyStorage> = {}): LegacyStorage {
  return { pokedex, settings: null, theme: null, language: null, ...rest };
}

describe('handoff payload', () => {

  it('round-trips a collection', () => {
    const source = storage(
      {
        '1': { won: true },
        '25': { won: true, shiny: true },
        '150': { won: false, mega: true },
      },
      { theme: 'dark', language: 'pt', settings: { muteAudio: true } },
    );

    const decoded = decodeHandoff(encodeHandoff(source));

    expect(decoded?.pokedex['1']).toEqual({ won: true, shiny: false, mega: false });
    expect(decoded?.pokedex['25']).toEqual({ won: true, shiny: true, mega: false });
    expect(decoded?.pokedex['150']).toEqual({ won: false, shiny: false, mega: true });
    expect(decoded?.theme).toBe('dark');
    expect(decoded?.language).toBe('pt');
    expect(decoded?.settings).toEqual({ muteAudio: true });
  });

  it('keeps an entry that is merely seen, distinct from one never met', () => {
    // `won: false` with no other flag is a real entry, and the difference
    // between it and an absent id is the whole reason for a presence bit.
    const decoded = decodeHandoff(encodeHandoff(storage({ '4': { won: false } })));

    expect(decoded?.pokedex['4']).toEqual({ won: false, shiny: false, mega: false });
    expect(decoded?.pokedex['5']).toBeUndefined();
  });

  it('carries alternate forms, which live far outside the National Dex range', () => {
    // The game stores form ids like 10034 alongside the base species. Packing
    // only 1-1025 would drop every mega and every Ogerpon mask, silently.
    const decoded = decodeHandoff(encodeHandoff(storage({
      '6': { won: true },
      '10034': { won: true, mega: true },
      '10277': { won: true, shiny: true },
    })));

    expect(decoded?.pokedex['10034']).toEqual({ won: true, shiny: false, mega: true });
    expect(decoded?.pokedex['10277']).toEqual({ won: true, shiny: true, mega: false });
  });

  it('fits a complete Pokédex into a fragment with room to spare', () => {
    const complete: LegacyStorage['pokedex'] = {};
    for (let id = 1; id <= 1025; id++) {
      complete[String(id)] = { won: true, shiny: true, mega: true, sprite: 'x'.repeat(90) };
    }

    const encoded = encodeHandoff(storage(complete));

    // Four bits per Pokémon rather than JSON. The same data as JSON is ~40 KB,
    // which base64 inflates past 50 KB — inside what browsers accept, but not
    // by a margin worth betting a collection on.
    expect(encoded.length).toBeLessThan(1200);
    expect(Object.keys(decodeHandoff(encoded)!.pokedex).length).toBe(1025);
  });

  it('drops sprites, which are derived from the id anyway', () => {
    const encoded = encodeHandoff(storage({ '1': { won: true, sprite: 'https://example.test/1.png' } }));

    expect(encoded).not.toContain('example');
    expect(decodeHandoff(encoded)?.pokedex['1']).not.toEqual(jasmine.objectContaining({ sprite: jasmine.anything() }));
  });

  it('refuses anything it cannot read, rather than throwing', () => {
    for (const bad of ['', 'not-base64!!', btoa('{}'), btoa('{"v":99}'), 'eyJ2IjoxfQ']) {
      expect(() => decodeHandoff(bad)).not.toThrow();
    }
    expect(decodeHandoff('not-base64!!')).toBeNull();
    expect(decodeHandoff(btoa('{"v":99}'))).toBeNull();
  });
});
