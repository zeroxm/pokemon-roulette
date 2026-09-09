import { TestBed } from '@angular/core/testing';
import { PokedexService, PokedexData, pokemonSpriteUrl } from './pokedex.service';

describe('PokedexService', () => {
  let service: PokedexService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokedexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // DATA-01: markSeen creates entry
  it('should create a caught entry when markSeen is called', () => {
    service.markSeen(1);
    expect(service.currentPokedex.caught['1']).toBeTruthy();
  });

  // DATA-01: idempotent
  it('should not duplicate caught entry when markSeen called twice for same id', () => {
    service.markSeen(1);
    service.markSeen(1);
    expect(Object.keys(service.currentPokedex.caught).length).toBe(1);
  });

  // DATA-02: markWon sets won:true
  it('should set won:true for all IDs when markWon is called', () => {
    service.markWon([1, 2]);
    expect(service.currentPokedex.caught['1'].won).toBeTrue();
    expect(service.currentPokedex.caught['2'].won).toBeTrue();
  });

  // DATA-02: markWon also marks unseen
  it('should mark unseen Pokémon as seen when markWon is called', () => {
    service.markWon([99]);
    expect(service.currentPokedex.caught['99']).toBeTruthy();
    expect(service.currentPokedex.caught['99'].won).toBeTrue();
  });

  // DATA-03: localStorage persistence on write
  it('should persist to localStorage after markSeen', () => {
    service.markSeen(25);
    const stored = JSON.parse(localStorage.getItem('pokemon-roulette-pokedex')!);
    expect(stored.caught['25']).toBeTruthy();
  });

  // DATA-03: Constructor reads from localStorage
  it('should restore state from localStorage on construction', () => {
    const saved: PokedexData = { caught: { '4': { won: false } } };
    localStorage.setItem('pokemon-roulette-pokedex', JSON.stringify(saved));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(PokedexService);
    expect(newService.currentPokedex.caught['4']).toBeTruthy();
  });

  // DATA-03: Fallback to empty state on invalid JSON
  it('should fall back to empty caught when localStorage has invalid JSON', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    localStorage.setItem('pokemon-roulette-pokedex', 'not-valid-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(PokedexService);
    expect(Object.keys(newService.currentPokedex.caught).length).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Invalid pokedex localStorage item:',
      'not-valid-json',
      'falling back to empty pokedex'
    );
  });

  // DATA-04: No reset method exists that could be wired to game loop
  it('should not have a clearPokedex method (reset-safety)', () => {
    expect((service as any)['clearPokedex']).toBeUndefined();
  });

  // DATA-05: Sprite URL stored on markSeen
  it('derives the deterministic sprite URL from the id', () => {
    expect(pokemonSpriteUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    );
  });


  // SHINY-01: shiny flag persistence
  it('should set shiny:true on entry when markSeen called with shiny=true — SHINY-01', () => {
    service.markSeen(25, true);
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
  });

  it('should upgrade existing non-shiny entry to shiny when markSeen called with shiny=true — SHINY-01', () => {
    service.markSeen(25);
    service.markSeen(25, true);
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
  });

  it('should not revert shiny flag once set — shiny=true is permanent — SHINY-01', () => {
    service.markSeen(25, true);
    service.markSeen(25, false);
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
  });

  it('should preserve shiny flag after markWon is called — SHINY-01', () => {
    service.markSeen(25, true);
    service.markWon([25]);
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
  });

  it('should propagate shiny to full family and forms when markSeen is called with shiny=true — SHINY-02', () => {
    service.markSeen(25, true);

    expect(service.currentPokedex.caught['172'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['26'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['10100'].shiny).toBeTrue();
  });

  it('should propagate shiny from a form id to base and the whole family — SHINY-02', () => {
    service.markSeen(10100, true);

    expect(service.currentPokedex.caught['172'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['25'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['26'].shiny).toBeTrue();
    expect(service.currentPokedex.caught['10100'].shiny).toBeTrue();
  });

  it('should normalize shiny on load for existing related entries only and persist the migration — SHINY-03', () => {
    const saved: PokedexData = {
      caught: {
        '25': { won: false, shiny: true },
        '26': { won: false },
        '172': { won: false },
      },
    };

    localStorage.setItem('pokemon-roulette-pokedex', JSON.stringify(saved));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(PokedexService);

    expect(newService.currentPokedex.caught['25'].shiny).toBeTrue();
    expect(newService.currentPokedex.caught['26'].shiny).toBeTrue();
    expect(newService.currentPokedex.caught['172'].shiny).toBeTrue();
    expect(newService.currentPokedex.caught['10100']).toBeUndefined();

    const persisted = JSON.parse(localStorage.getItem('pokemon-roulette-pokedex')!);
    expect(persisted.caught['26'].shiny).toBeTrue();
    expect(persisted.caught['172'].shiny).toBeTrue();
    expect(persisted.caught['10100']).toBeUndefined();
  });

  // Observable: emits on subscribe (BehaviorSubject semantics)
  it('should emit current value immediately on pokedex$ subscribe', (done) => {
    service.pokedex$.subscribe(data => {
      expect(data).toBeTruthy();
      done();
    });
  });

  // Observable: emits after mutation
  it('should emit new value after markSeen', (done) => {
    let emitCount = 0;
    service.pokedex$.subscribe(data => {
      emitCount++;
      if (emitCount === 2) {
        expect(data.caught['10']).toBeTruthy();
        done();
      }
    });
    service.markSeen(10);
  });

  // ── Additional shiny edge cases ────────────────────────────────────────

  // Re-catch edge case: pokemon was already won; shiny upgrade must preserve won flag
  it('should preserve won:true when upgrading existing won entry to shiny — SHINY-EDGE-01', () => {
    service.markSeen(1);
    service.markWon([1]);

    // Simulate catching the same pokemon again via shiny roulette
    service.markSeen(1, true);

    const entry = service.currentPokedex.caught['1'];
    expect(entry.shiny).toBeTrue();
    expect(entry.won).toBeTrue();   // must be preserved — not reset by markSeen
  });

  // Explicit false param: markSeen(id, false) must not revert an already-shiny entry
  it('should not revert shiny when markSeen is called with explicit shiny=false on shiny entry — SHINY-EDGE-02', () => {
    service.markSeen(7, true);
    expect(service.currentPokedex.caught['7'].shiny).toBeTrue();

    // Explicit false (not just omitted param) must not revert
    service.markSeen(7, false);

    expect(service.currentPokedex.caught['7'].shiny).toBeTrue();
  });

  // No-op re-catch: identical data must not trigger a pokedex$ emission
  it('should not emit a new pokedex$ value when markSeen is called with unchanged data — SHINY-EDGE-03', (done) => {
    // First call creates the entry and emits
    service.markSeen(50);

    let emitCount = 0;
    service.pokedex$.subscribe(() => {
      emitCount++;
    });

    // Second call with same id and same shiny=false → 'changed' is false → no updatePokedex call
    service.markSeen(50);
    service.markSeen(50, false);

    // Use setTimeout to let any pending async emissions drain before asserting
    setTimeout(() => {
      // emitCount === 1 because pokedex$ is a BehaviorSubject: emits current value on subscribe,
      // but does NOT emit again for the no-op markSeen calls
      expect(emitCount).toBe(1);
      done();
    }, 0);
  });
});

describe('PokedexService catch counting', () => {
  let service: PokedexService;

  const load = (caught: unknown): PokedexService => {
    localStorage.setItem('pokemon-roulette-pokedex', JSON.stringify({ caught }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(PokedexService);
  };

  const stored = (): Record<string, Record<string, unknown>> =>
    JSON.parse(localStorage.getItem('pokemon-roulette-pokedex')!).caught;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokedexService);
  });

  afterAll(() => localStorage.clear());

  it('starts a newly caught Pokémon at one', () => {
    service.recordCatch(25);

    expect(service.currentPokedex.caught['25'].count)
      .withContext('an entry exists because it was obtained, so zero is never valid')
      .toBe(1);
  });

  it('accumulates', () => {
    service.recordCatch(25);
    service.recordCatch(25);
    service.recordCatch(25);

    expect(service.currentPokedex.caught['25'].count).toBe(3);
  });

  // Evolving, marking a shiny and getting a stolen Pokémon back all register
  // without acquiring anything.
  it('does not count a registration that is not a catch', () => {
    service.recordCatch(25);
    service.markSeen(25);

    expect(service.currentPokedex.caught['25'].count).toBe(1);
  });

  it('does not count the relatives a shiny propagates to', () => {
    service.recordCatch(1, true); // Bulbasaur, shiny

    expect(service.currentPokedex.caught['1'].count).toBe(1);
    expect(service.currentPokedex.caught['2'].count)
      .withContext('Ivysaur was marked shiny by propagation, not caught')
      .toBe(1);
    expect(service.currentPokedex.caught['2'].shiny).toBeTrue();
  });

  it('keeps the count when a Pokémon wins the game', () => {
    service.recordCatch(25);
    service.recordCatch(25);
    service.markWon([25]);

    expect(service.currentPokedex.caught['25'].count).toBe(2);
    expect(service.currentPokedex.caught['25'].won).toBeTrue();
  });

  describe('upgrading an older stored Pokédex', () => {
    it('seeds an entry that predates counting to one', () => {
      const upgraded = load({ 25: { won: true, sprite: 'https://example.invalid/25.png' } });

      expect(upgraded.currentPokedex.caught['25'].count)
        .withContext('a floor, not a fabrication — zero beside a caught marker reads as a bug')
        .toBe(1);
    });

    it('drops the stored sprite', () => {
      load({ 25: { won: true, sprite: 'https://example.invalid/25.png' } });

      expect('sprite' in stored()['25'])
        .withContext('a thousand copies of one host was most of what a saved Pokédex weighed')
        .toBeFalse();
    });

    it('preserves what the entry already meant', () => {
      const upgraded = load({ 6: { won: true, sprite: 'x', shiny: true, mega: true } });
      const entry = upgraded.currentPokedex.caught['6'];

      expect(entry.won).toBeTrue();
      expect(entry.shiny).toBeTrue();
      expect(entry.mega).toBeTrue();
    });

    it('leaves an already-upgraded blob alone', () => {
      const upgraded = load({ 25: { won: false, count: 7 } });

      expect(upgraded.currentPokedex.caught['25'].count).toBe(7);
    });
  });

  it('derives the sprite url from the id', () => {
    expect(pokemonSpriteUrl(25)).toContain('/25.png');
  });
});
