import { EMPTY_SNAPSHOT, SyncSnapshot, mergeSnapshots, parseSyncSnapshot } from './sync-snapshot';
import { GameSettings } from '../settings-service/settings.service';

function snapshot(partial: Partial<SyncSnapshot>): SyncSnapshot {
  return { ...EMPTY_SNAPSHOT, ...partial };
}

const settings: GameSettings = {
  muteAudio: true,
  skipShinyRolls: false,
  skipMegaEvolutionAnimation: false,
  lessExplanations: false,
  defaultGender: 'always-choose',
};

describe('mergeSnapshots', () => {

  it('unions two disjoint Pokédexes', () => {
    const desktop = snapshot({ pokedex: { '6': { won: true, shiny: false, mega: false, count: 2 } } });
    const phone = snapshot({ pokedex: { '25': { won: false, shiny: true, mega: false, count: 1 } } });

    const merged = mergeSnapshots(desktop, phone);

    expect(Object.keys(merged.pokedex).sort()).toEqual(['25', '6']);
    expect(merged.pokedex['6'].count).toBe(2);
    expect(merged.pokedex['25'].shiny).toBeTrue();
  });

  it('never lets a false clear a true', () => {
    const withShiny = snapshot({ pokedex: { '6': { won: true, shiny: true, mega: true, count: 5 } } });
    const withoutShiny = snapshot({ pokedex: { '6': { won: false, shiny: false, mega: false, count: 1 } } });

    for (const merged of [mergeSnapshots(withShiny, withoutShiny), mergeSnapshots(withoutShiny, withShiny)]) {
      expect(merged.pokedex['6']).toEqual({ won: true, shiny: true, mega: true, count: 5 });
    }
  });

  it('keeps the earliest unlock time for an achievement both devices have', () => {
    const early = snapshot({ achievements: { oh_shiny: '2026-01-01T00:00:00Z' } });
    const late = snapshot({ achievements: { oh_shiny: '2026-06-01T00:00:00Z' } });

    expect(mergeSnapshots(early, late).achievements['oh_shiny']).toBe('2026-01-01T00:00:00Z');
    expect(mergeSnapshots(late, early).achievements['oh_shiny']).toBe('2026-01-01T00:00:00Z');
  });

  it('takes the higher counter rather than summing', () => {
    // The documented trade: two devices offline at once under-count. Pinned
    // here so nobody "fixes" it into a rule that can double-count on a retry.
    const a = snapshot({ counters: { spins_total: 100 } });
    const b = snapshot({ counters: { spins_total: 120 } });

    expect(mergeSnapshots(a, b).counters['spins_total']).toBe(120);
  });

  it('lets the newer side win on settings, and only on settings', () => {
    const older = snapshot({ badges: ['boulder'], settings });
    const newer = snapshot({ badges: ['cascade'], settings: { ...settings, muteAudio: false } });

    const merged = mergeSnapshots(older, newer);

    expect(merged.settings?.muteAudio).toBeFalse();
    expect(merged.badges).toEqual(['boulder', 'cascade']);
  });

  it('keeps the other side settings when the newer side has none', () => {
    expect(mergeSnapshots(snapshot({ settings }), snapshot({})).settings).toEqual(settings);
  });

  it('converges when two devices go offline, both play, and both come back', () => {
    // The hardest case and the one that matters: neither device saw the other,
    // and the order they reconnect in must not change the outcome.
    const shared = snapshot({
      pokedex: { '1': { won: true, shiny: false, mega: false, count: 1 } },
      badges: ['boulder'],
      counters: { spins_total: 10 },
      achievements: { first_steps: '2026-01-01T00:00:00Z' },
    });

    const desktop = snapshot({
      pokedex: {
        '1': { won: true, shiny: true, mega: false, count: 3 },
        '4': { won: true, shiny: false, mega: false, count: 1 },
      },
      badges: ['boulder', 'cascade'],
      counters: { spins_total: 40, runs_completed: 1 },
      achievements: { first_steps: '2026-01-01T00:00:00Z', oh_shiny: '2026-02-01T00:00:00Z' },
    });

    const phone = snapshot({
      pokedex: {
        '1': { won: true, shiny: false, mega: true, count: 8 },
        '7': { won: false, shiny: false, mega: false, count: 2 },
      },
      badges: ['boulder', 'thunder'],
      counters: { spins_total: 25, eggs_hatched: 4 },
      achievements: { first_steps: '2025-12-01T00:00:00Z' },
    });

    const desktopFirst = mergeSnapshots(mergeSnapshots(shared, desktop), phone);
    const phoneFirst = mergeSnapshots(mergeSnapshots(shared, phone), desktop);

    expect(desktopFirst).toEqual(phoneFirst);
    expect(desktopFirst.pokedex['1']).toEqual({ won: true, shiny: true, mega: true, count: 8 });
    expect(desktopFirst.badges).toEqual(['boulder', 'cascade', 'thunder']);
    expect(desktopFirst.counters).toEqual({ spins_total: 40, runs_completed: 1, eggs_hatched: 4 });
    expect(desktopFirst.achievements['first_steps']).toBe('2025-12-01T00:00:00Z');
  });

  it('is a no-op when the same state is merged twice', () => {
    // What makes a blind retry safe, and why there is no idempotency key.
    const once = mergeSnapshots(EMPTY_SNAPSHOT, snapshot({ counters: { spins_total: 11 } }));
    expect(mergeSnapshots(once, once)).toEqual(once);
  });
});

describe('parseSyncSnapshot', () => {

  it('reads a well-formed response', () => {
    const parsed = parseSyncSnapshot({
      schema_version: 1,
      pokedex: { '6': { won: true, shiny: true, mega: false, count: 11 } },
      badges: ['boulder'],
      achievements: { oh_shiny: '2026-03-01T12:00:00Z' },
      counters: { runs_completed: 12 },
      settings: { muteAudio: true },
    });

    expect(parsed.pokedex['6']).toEqual({ won: true, shiny: true, mega: false, count: 11 });
    expect(parsed.badges).toEqual(['boulder']);
    expect(parsed.counters).toEqual({ runs_completed: 12 });
    expect(parsed.settings).toEqual({ muteAudio: true } as unknown as GameSettings);
  });

  it('floors a Pokédex count at one', () => {
    const parsed = parseSyncSnapshot({ pokedex: { '6': { won: true, count: 0 } } });
    expect(parsed.pokedex['6'].count).toBe(1);
  });

  it('survives a response from a build it has never met', () => {
    // The API deploys on its own schedule, so an unknown field is routine.
    // Refusing to parse would strand a collection on the server.
    const parsed = parseSyncSnapshot({
      schema_version: 99,
      pokedex: { '6': { won: true, count: 3, sparkles: 'yes' } },
      trophies: ['???'],
      counters: { runs_completed: 4, counter_from_the_future: 9 },
    });

    expect(parsed.pokedex['6'].count).toBe(3);
    expect(parsed.counters).toEqual({ runs_completed: 4, counter_from_the_future: 9 });
  });

  it('reads garbage as empty rather than throwing', () => {
    for (const body of [null, 'nope', 42, [], { pokedex: 'no', badges: {}, counters: [] }]) {
      expect(() => parseSyncSnapshot(body)).not.toThrow();
      expect(parseSyncSnapshot(body).badges).toEqual([]);
    }
  });
});
