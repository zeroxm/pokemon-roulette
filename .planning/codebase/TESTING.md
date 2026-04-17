# Testing Patterns

**Analysis Date:** 2025-01-31

## Framework

**Runner:** Karma `~6.4.4` — configured via `angular.json` (`architect.test.builder: @angular-devkit/build-angular:karma`)

**Test Framework:** Jasmine `~6.1.0` — `jasmine-core`, `karma-jasmine`

**Type Definitions:** `@types/jasmine ~6.0.0`

**Reporter:** `karma-jasmine-html-reporter ~2.2.0`, `karma-coverage ~2.2.1`

**Browser:** Chrome headless via `karma-chrome-launcher ~3.2.0`

**Angular Testing Utilities:** `@angular/core/testing` — `TestBed`, `ComponentFixture`

## How to Run

```bash
npm test                  # Run all tests (Karma with Chrome)
ng test                   # Equivalent, runs Karma
```

No watch mode or coverage command is configured in `package.json` scripts beyond `ng test`. Coverage is available via Karma's built-in coverage reporter (`karma-coverage`).

## Test File Organization

**Pattern:** Co-located `*.spec.ts` files alongside source files.

```
src/app/
├── app.component.ts
├── app.component.spec.ts
├── services/
│   ├── game-state-service/
│   │   ├── game-state.service.ts
│   │   └── game-state.service.spec.ts
│   └── pokemon-service/
│       ├── pokemon.service.ts
│       └── pokemon.service.spec.ts
├── main-game/roulette-container/roulettes/
│   └── starter-roulette/
│       ├── starter-roulette.component.ts
│       └── starter-roulette.component.spec.ts
└── utils/
    ├── odd-utils.ts
    └── odd-utils.spec.ts
```

**Glob:** `src/**/*.spec.ts` (configured in `tsconfig.spec.json`)

## Test Structure

**Component test suite:**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SomeComponent } from './some.component';

describe('SomeComponent', () => {
  let component: SomeComponent;
  let fixture: ComponentFixture<SomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SomeComponent, TranslateModule.forRoot()],
      providers: [...]
    }).compileComponents();

    fixture = TestBed.createComponent(SomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```
Example: `src/app/main-game/main-game.component.spec.ts`

**Service test suite:**
```typescript
import { TestBed } from '@angular/core/testing';
import { SomeService } from './some.service';

describe('SomeService', () => {
  let service: SomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```
Example: `src/app/services/game-state-service/game-state.service.spec.ts`

**Utility function test suite (no Angular):**
```typescript
import { someUtility } from './some-utility';

describe('someUtility function', () => {
  it('description', () => {
    const result = someUtility(args);
    expect(result).toEqual(expected);
  });
});
```
Example: `src/app/utils/odd-utils.spec.ts`

## Mocking Approach

### jasmine.createSpyObj (primary pattern)
Used for services with methods that need to be controlled or observed:
```typescript
// src/app/main-game/main-game.component.spec.ts
const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
const analyticsServiceSpyObj = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);

TestBed.configureTestingModule({
  providers: [
    { provide: HttpClient, useValue: httpSpyObj },
    { provide: AnalyticsService, useValue: analyticsServiceSpyObj }
  ]
});
httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
```

### useValue with plain objects (for observable-heavy services)
When only specific methods/observables are needed, plain objects with arrow functions suffice:
```typescript
// src/app/main-game/roulette-container/roulettes/starter-roulette/starter-roulette.component.spec.ts
const generationSubject = new BehaviorSubject<GenerationItem>({...});

providers: [
  {
    provide: GenerationService,
    useValue: {
      getGeneration: () => generationSubject.asObservable()
    }
  },
  {
    provide: PokemonService,
    useValue: { getPokemonByIdArray }
  }
]
```

### Spy on return value
```typescript
// src/app/services/trainer-service/trainer.service.spec.ts
httpSpy.get.and.returnValue(of({
  sprites: { other: { 'official-artwork': { front_default: 'url', front_shiny: 'url' } } }
}));
```

### spyOn for console/global methods
```typescript
const consoleErrorSpy = spyOn(console, 'error');
expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid pokedex localStorage item:', ...);
```
Example: `src/app/services/pokedex-service/pokedex.service.spec.ts`

### Accessing private members in tests
TypeScript cast to `any` when testing internal state:
```typescript
expect((service as any)['spriteCache'].has(4)).toBeTrue();
expect((component as any).translatedItems).toEqual(...);
```

## Fixtures and Test Data

**Inline constant objects:** Test-specific `PokemonItem` fixtures defined as `const` at describe-block level:
```typescript
// src/app/services/trainer-service/trainer.service.spec.ts
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

**Factory functions:** Used when many similar objects are needed:
```typescript
// src/app/utils/odd-utils.spec.ts
const makeItems = (text: string, count: number): WheelItem[] =>
  Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));
```

**Deep cloning fixtures:** `structuredClone()` used to prevent mutation between tests:
```typescript
service.trainerTeam = [structuredClone(palafinZero), structuredClone(bulbasaur)];
```

**No shared fixture files:** All test data is defined inline within the spec file.

## Nested describe Blocks

Used to group related scenarios under a logical label:
```typescript
describe('TrainerService', () => {
  // top-level setup and tests...

  describe('sticky battle form transforms', () => {
    const aegislashShield: PokemonItem = { ... };

    it('should toggle aegislash shield→blade on battle entry...', () => { ... });
    it('should toggle aegislash blade→shield on the next battle', () => { ... });
  });
});
```
Example: `src/app/services/trainer-service/trainer.service.spec.ts`

## Common Test Patterns

### localStorage isolation
Clear storage before each test to prevent state leakage:
```typescript
beforeEach(() => {
  localStorage.clear();
  TestBed.configureTestingModule({});
  service = TestBed.inject(PokedexService);
});
```
Example: `src/app/services/pokedex-service/pokedex.service.spec.ts`

### Testing constructor initialization via TestBed.resetTestingModule()
When testing that a service reads localStorage on construction, reset and reconfigure the module:
```typescript
localStorage.setItem('key', JSON.stringify(saved));
TestBed.resetTestingModule();
TestBed.configureTestingModule({});
const newService = TestBed.inject(PokedexService);
expect(newService.someState).toBeTruthy();
```

### Async observable testing with `done`
```typescript
it('should emit current value immediately on pokedex$ subscribe', (done) => {
  service.pokedex$.subscribe(data => {
    expect(data).toBeTruthy();
    done();
  });
});
```

### Testing via real service interaction (integration-lite)
Some tests use the real `GameStateService` (not mocked) to emit state changes:
```typescript
// src/app/services/trainer-service/trainer.service.spec.ts
const emitGameState = (gameState: GameState): void => {
  gameStateService.setNextState(gameState);
  gameStateService.finishCurrentState();
};
// ...
emitGameState('gym-battle');
expect(service.trainerTeam[0].pokemonId).toBe(10256);
```

### Statistical/probabilistic testing
For randomness behavior, sigma-tolerance bounds are used to verify distribution fairness:
```typescript
// src/app/wheel/wheel.component.spec.ts
const sigmaTolerance = (p: number, runs: number, sigma = 4) =>
  sigma * Math.sqrt((p * (1 - p)) / runs);

const numRuns = 10000;
const expectedProbability = 1 / 8;
const tolerance = sigmaTolerance(expectedProbability, numRuns);
// ...
expect(Math.abs(probabilities[i] - expectedProbability)).toBeLessThan(tolerance);
```

### Test ID comments
Tests tracking specific requirements use inline comment IDs:
```typescript
// DATA-01: markSeen creates entry
it('should create a caught entry when markSeen is called', () => { ... });
// SHINY-01: shiny flag persistence
it('should set shiny:true on entry when markSeen called with shiny=true — SHINY-01', () => { ... });
```
Example: `src/app/services/pokedex-service/pokedex.service.spec.ts`

### Helper functions in describe scope
Shared assertions and utility functions are defined inside `describe` blocks:
```typescript
describe('interleaveOdds utility', () => {
  function indicesOf(result: WheelItem[], text: string): number[] { ... }
  function gapsBetween(indices: number[]): number[] { ... }
  function isEvenlySpread(values: number[]): boolean { ... }
  function assertDistributionInvariants(yesCount: number, noCount: number): void {
    // shared assertion logic used by multiple it() blocks
  }

  it('spaces a larger yes list (10 yes, 2 no)', () => {
    assertDistributionInvariants(10, 2);
  });
});
```
Example: `src/app/utils/odd-utils.spec.ts`

## Coverage

**Tool:** `karma-coverage ~2.2.1` (installed)

**Thresholds:** Not configured — no `coverageThreshold` found in `angular.json`.

**View coverage:** Run `ng test` — Karma generates a coverage report (HTML) in `coverage/` directory when coverage is enabled in karma config.

## Test Types Present

**Unit Tests:** Isolated service method tests (e.g., `pokemon.service.spec.ts`, `odd-utils.spec.ts`)

**Component Smoke Tests:** Nearly every component has a minimal `'should create'` test verifying `TestBed` instantiation (most roulette component specs)

**Behavioral Tests:** Services with complex logic have comprehensive behavioral tests (e.g., `trainer.service.spec.ts`, `pokedex.service.spec.ts`)

**Statistical Tests:** Probabilistic distribution validation (`wheel.component.spec.ts`)

**No E2E tests detected** — no Cypress, Playwright, or Protractor configuration present.

---

*Testing analysis: 2025-01-31*
