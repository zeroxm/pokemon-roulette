# Testing Patterns

**Analysis Date:** 2025-07-14

## Test Framework

**Runner:**
- Karma `~6.4.4` with `@angular-devkit/build-angular:karma` builder
- Config: `angular.json` → `projects.pokemon-roulette.architect.test`
- `tsconfig.spec.json` extends base tsconfig; adds `jasmine` and `@angular/localize` types

**Assertion Library:**
- Jasmine `~6.1.0` (via `jasmine-core`)
- HTML reporter: `karma-jasmine-html-reporter ~2.2.0`

**Run Commands:**
```bash
npm test              # Run all tests (opens Chrome, watch mode by default via ng test)
ng test               # Equivalent
ng test --no-watch    # Run once without watch
ng test --code-coverage  # Run with coverage report (karma-coverage ~2.2.1 installed)
```

**Coverage Tool:**
- `karma-coverage ~2.2.1` installed but **no coverage threshold or reporter configured** in `angular.json` — coverage must be enabled manually with `--code-coverage` flag; no enforcement gate exists.

## Test File Organization

**Location:**
- Co-located with source files — spec files sit next to the implementation file they test
- Example: `src/app/services/trainer-service/trainer.service.ts` ↔ `trainer.service.spec.ts`

**Naming:**
- Components: `*.component.spec.ts`
- Services: `*.service.spec.ts`
- Utilities: `*.spec.ts` (no `.component` or `.service` suffix) — e.g., `odd-utils.spec.ts`
- Exception: `area-zero-roulette.spec.ts` (class named `AreaZeroRoulette`, not using component suffix)

**Coverage:**
- 60 spec files total covering components, services, and utility functions
- Every component and service has at least a `should create` smoke test
- Several services and many simple components have only the smoke test

## Test Structure

**Suite Organization:**
```typescript
describe('TrainerService', () => {
  let service: TrainerService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  // Shared fixtures at describe scope
  const bulbasaur: PokemonItem = { ... };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...] });
    service = TestBed.inject(TrainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Nested describe for logical grouping
  describe('sticky battle form transforms', () => {
    it('should toggle aegislash shield→blade on battle entry', () => { ... });
  });
});
```

**Setup Pattern:**
- `beforeEach` used universally to reset state between tests
- `TestBed.configureTestingModule()` called in every `beforeEach`
- `localStorage.clear()` called in `beforeEach` for services/components that use localStorage (e.g., `pokedex.service.spec.ts`, `roulette-container.component.spec.ts`, `pokedex-entry.component.spec.ts`)
- `gameStateService.resetGameState()` and `trainerService.resetTeam()` called explicitly in integration-style tests

**Async setup:**
```typescript
// Component tests use async/await for compileComponents
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent, TranslateModule.forRoot()],
  }).compileComponents();

  fixture = TestBed.createComponent(MyComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

// Service tests use synchronous beforeEach
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [...] });
  service = TestBed.inject(MyService);
});
```

## Mocking

**Framework:** Jasmine's built-in spy/mock system — no external mock library (no `jest`, `sinon`, etc.)

**HttpClient mock pattern (standard):**
```typescript
const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
TestBed.configureTestingModule({
  providers: [{ provide: HttpClient, useValue: httpSpyObj }]
});
httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
// Return a value:
httpSpy.get.and.returnValue(of({
  sprites: { other: { 'official-artwork': { front_default: '...', front_shiny: '...' } } }
}));
```
Used in: `pokemon.service.spec.ts`, `trainer.service.spec.ts`, `evolution.service.spec.ts`, `generation-roulette.component.spec.ts`

**Service stub pattern (inline object):**
```typescript
{
  provide: GenerationService,
  useValue: {
    getGeneration: () => generationSubject.asObservable()
  }
}
```
Used in `starter-roulette.component.spec.ts`, `area-zero-roulette.spec.ts`

**`jasmine.createSpyObj` with getter properties:**
```typescript
darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', [], {
  darkMode$: of(false)   // getter property
});
```
Used in `pokedex-entry.component.spec.ts`

**Method spy:**
```typescript
spyOn(component.selectedPokemonEvent, 'emit');
expect(component.selectedPokemonEvent.emit).toHaveBeenCalledWith(component.paradoxPokemon[3]);

spyOn(translateService, 'use');
expect(translateService.use).toHaveBeenCalledWith('en');

spyOn(console, 'error');
```

**What to Mock:**
- `HttpClient` — always mocked in service/component tests that involve HTTP calls; prevents real network requests
- Services with complex dependencies — provided as inline `useValue` stubs
- `DarkModeService` — mocked via `createSpyObj` with Observable getter when component subscribes to `darkMode$`

**What NOT to Mock:**
- `GameStateService` — real instance injected and controlled via `gameStateService.resetGameState()` + `emitGameState()` helper
- `PokemonService` for data-only methods — real instance used, since `getPokemonByIdArray` is pure (no HTTP)
- `PokedexService` — real instance used; `localStorage` is the integration point, cleared in `beforeEach`
- `TranslateService` — provided through `TranslateModule.forRoot()` real module

## Fixtures and Factories

**Test data as `const` objects at describe scope:**
```typescript
const palafinZero: PokemonItem = {
  text: 'pokemon.palafin',
  pokemonId: 964,
  fillStyle: 'darkblue',
  sprite: null,
  shiny: false,
  power: 2,
  weight: 1,
};
```

**Factory functions for array generation:**
```typescript
const makeItems = (text: string, count: number): WheelItem[] =>
  Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));
```
Used in `odd-utils.spec.ts`

**`structuredClone()` for test isolation:**
```typescript
service.trainerTeam = [structuredClone(palafinZero), structuredClone(bulbasaur)];
```
Prevents mutation of shared test fixtures.

**BehaviorSubject as controllable observable:**
```typescript
const generationSubject = new BehaviorSubject<GenerationItem>({
  text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1, weight: 1
});
// ...
{ provide: GenerationService, useValue: { getGeneration: () => generationSubject.asObservable() } }
```
Used in `starter-roulette.component.spec.ts` to control observable emissions.

**LocalStorage as test state:**
```typescript
const saved: PokedexData = { caught: { '4': { won: false, sprite: '...' } } };
localStorage.setItem('pokemon-roulette-pokedex', JSON.stringify(saved));
TestBed.resetTestingModule();
TestBed.configureTestingModule({});
const newService = TestBed.inject(PokedexService);
```
`TestBed.resetTestingModule()` used to re-instantiate services with pre-seeded localStorage.

## Coverage

**Requirements:** None enforced — no thresholds in `angular.json` or any config file.

**View Coverage:**
```bash
ng test --code-coverage
# Report written to coverage/ directory (lcov format via karma-coverage)
```

## Test Types

**Unit Tests (services):**
- Pure logic tested against real service instances
- Example: `pokemon.service.spec.ts` — tests `getPokemonByIdArray()` with known IDs
- Example: `evolution.service.spec.ts` — tests form alias resolution for Pokémon IDs > 10000
- Example: `pokedex.service.spec.ts` — tests localStorage persistence, shiny propagation, Observable semantics

**Integration Tests (component + services):**
- `roulette-container.component.spec.ts` — full integration with real `GameStateService`, `TrainerService`, `PokedexService`; tests multi-step flows like form selection, shiny capture, Champion win
- `trainer.service.spec.ts` — tests battle form transforms driven by real `GameStateService` state changes

**Statistical / Property Tests:**
- `wheel.component.spec.ts` — runs `getRandomWeightedIndex()` 10,000–100,000 times and asserts statistical distribution within 4–5 sigma tolerance; validates both equal-weight and weighted scenarios

**Algorithm Tests:**
- `odd-utils.spec.ts` — tests `interleaveOdds()` distribution invariants using helper functions for gap analysis; parameterized via an `assertDistributionInvariants(yesCount, noCount)` helper

**DOM Tests:**
- `pokedex-entry.component.spec.ts` — queries `fixture.nativeElement` for CSS classes, `img` elements, and click events; 15 DOM assertions across visual states

**Smoke Tests (most components and simple services):**
- Only assert `expect(component).toBeTruthy()` / `expect(service).toBeTruthy()`
- Affected files: `badges.service.spec.ts`, `items.service.spec.ts`, `settings.service.spec.ts`, `dark-mode.service.spec.ts`, `coffee.component.spec.ts`, `credits.component.spec.ts`, and most simple roulette components

## Common Patterns

**Triggering state changes through services (integration style):**
```typescript
const emitGameState = (gameState: GameState): void => {
  gameStateService.setNextState(gameState);
  gameStateService.finishCurrentState();
};

emitGameState('gym-battle');
expect(service.trainerTeam[0].pokemonId).toBe(10256);
```

**Testing EventEmitter output:**
```typescript
spyOn(component.selectedPokemonEvent, 'emit');
component.onItemSelected(3);
expect(component.selectedPokemonEvent.emit).toHaveBeenCalledWith(component.paradoxPokemon[3]);
```

**Testing Observable emissions (done callback):**
```typescript
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
```

**Testing private members (cast to `any`):**
```typescript
expect((service as any)['spriteCache'].has(4)).toBeTrue();
expect((component as any).translatedItems).toBeDefined();
(component as any).translatedItems = component.items; // Set private field for test setup
```

**Labeled test IDs for cross-referencing:**
Many tests in `pokedex.service.spec.ts`, `roulette-container.component.spec.ts`, and `pokedex-entry.component.spec.ts` use tracking comment labels that map to acceptance criteria:
```typescript
// DATA-01: markSeen creates entry
it('should create a caught entry when markSeen is called', () => { ... });

// SHINY-01: shiny flag persistence
it('should set shiny:true on entry when markSeen called with shiny=true — SHINY-01', () => { ... });
```

**TranslateModule in component tests:**
Always include `TranslateModule.forRoot()` in `imports` for any component that uses `TranslatePipe` or `TranslateService`:
```typescript
await TestBed.configureTestingModule({
  imports: [MyComponent, TranslateModule.forRoot()]
}).compileComponents();
```

**Icon providers in component tests:**
When testing components that use `@ng-icons`, provide icons explicitly:
```typescript
providers: [
  provideIcons({ bootstrapArrowRepeat, bootstrapCheck, ... })
]
```
See `roulette-container.component.spec.ts` for the full icon list pattern.

## Statistics

- **Total spec files:** 60
- **Total `describe` blocks:** 67 (some files have nested `describe` for logical grouping)
- **Total `it` blocks:** ~175
- **Skipped/focused tests:** None (`xit`, `xdescribe`, `fit`, `fdescribe` not used)
- **E2E tests:** Not present — no Cypress, Playwright, or Protractor setup

---

*Testing analysis: 2025-07-14*
