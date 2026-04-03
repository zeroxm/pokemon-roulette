# Testing Patterns

**Analysis Date:** 2025-01-10

## Test Framework

**Runner:**
- Karma 6.4.4 with Chrome launcher
- Configuration: `angular.json` specifies test builder `@angular-devkit/build-angular:karma`
- Test TS config: `tsconfig.spec.json` extends `tsconfig.json` and includes `src/**/*.spec.ts`

**Assertion Library:**
- Jasmine 6.1.0

**Run Commands:**
```bash
npm test                # Run all tests via Karma
ng test                 # Alias for npm test
```

Tests automatically re-run on file changes (watch mode). Coverage available via Karma Coverage plugin.

## Test File Organization

**Location:**
- Co-located with source files
- Same directory as component/service being tested

**Naming:**
- `{feature}.spec.ts` (e.g., `pokemon.service.spec.ts`, `app.component.spec.ts`)
- Test file stored in same directory as source file

**Structure:**
```
src/app/
├── services/
│   ├── pokemon-service/
│   │   ├── pokemon.service.ts
│   │   └── pokemon.service.spec.ts
│   └── generation-service/
│       ├── generation.service.ts
│       └── generation.service.spec.ts
├── main-game/
│   ├── roulette-container.component.ts
│   └── roulette-container.component.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('PokemonService', () => {
  let service: PokemonService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // Setup
  });

  it('should be created', () => {
    // Test
  });

  it('should return pokemon list for valid id array', () => {
    // Test
  });
});
```

**Patterns:**

1. **Setup pattern** (beforeEach):
   - Configure TestBed with imports, providers, declarations
   - Create spy objects for dependencies
   - Inject service/component under test
   - Perform initial setup (e.g., `gameStateService.resetGameState()`)

2. **Assertion pattern**:
   - `expect(value).toBeTruthy()` - Value exists/is truthy
   - `expect(array).toEqual(expected)` - Deep equality
   - `expect(value.map(...)).toEqual([...])` - Transform and compare
   - `expect(component).toBeDefined()` - Value exists

3. **Teardown pattern**:
   - Implicit via Karma test runner cleanup
   - Services automatically instantiated/destroyed per test

## Test Examples

### Component Test (RouterContainer)
**File:** `src/app/main-game/roulette-container/roulette-container.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { RouletteContainerComponent } from './roulette-container.component';

describe('RouletteContainerComponent', () => {
  let component: RouletteContainerComponent;
  let fixture: ComponentFixture<RouletteContainerComponent>;
  let pokemonService: PokemonService;
  let trainerService: TrainerService;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteContainerComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({
          bootstrapArrowRepeat,
          bootstrapCheck,
          // ... icons
        }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteContainerComponent);
    component = fixture.componentInstance;
    pokemonService = TestBed.inject(PokemonService);
    trainerService = TestBed.inject(TrainerService);
    gameStateService = TestBed.inject(GameStateService);
    gameStateService.resetGameState();
    trainerService.resetTeam();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route to form selection when captured pokemon has multiple forms', () => {
    const deoxys = pokemonService.getPokemonById(386);
    expect(deoxys).toBeDefined();

    component.capturePokemon(deoxys!);

    expect(component.getGameState()).toBe('select-form');
    expect(component.pokemonForms.map(form => form.pokemonId)).toEqual([386, 10001, 10002, 10003]);
    expect(trainerService.getTeam().length).toBe(0);
  });

  it('should capture immediately when pokemon has no forms', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    component.capturePokemon(bulbasaur!);

    expect(component.getGameState()).toBe('check-shininess');
    expect(trainerService.getTeam().length).toBe(1);
    expect(trainerService.getTeam()[0].pokemonId).toBe(1);
  });
});
```

### Service Test with Mocking (PokemonService)
**File:** `src/app/services/pokemon-service/pokemon.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { PokemonService } from './pokemon.service';
import { HttpClient } from '@angular/common/http';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(PokemonService);
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return pokemon list for valid id array', () => {
    const result = service.getPokemonByIdArray([1, 4, 7]);

    expect(result.length).toBe(3);
    expect(result.map(pokemon => pokemon.pokemonId)).toEqual([1, 4, 7]);
  });

  it('should ignore ids that are not in national dex', () => {
    const result = service.getPokemonByIdArray([1, 999999, 7]);

    expect(result.map(pokemon => pokemon.pokemonId)).toEqual([1, 7]);
  });
});
```

### Roulette Component Test with Mock Services
**File:** `src/app/main-game/roulette-container/roulettes/starter-roulette/starter-roulette.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { StarterRouletteComponent } from './starter-roulette.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';

describe('StarterRouletteComponent', () => {
  let component: StarterRouletteComponent;
  let fixture: ComponentFixture<StarterRouletteComponent>;

  const generationSubject = new BehaviorSubject<GenerationItem>({
    text: 'Gen 1',
    region: 'Kanto',
    fillStyle: 'crimson',
    id: 1,
    weight: 1
  });

  const getPokemonByIdArray = (pokemonIds: number[]): PokemonItem[] =>
    pokemonIds.map((pokemonId) => ({
      text: `pokemon.${pokemonId}`,
      pokemonId,
      fillStyle: 'black',
      sprite: null,
      shiny: false,
      power: 1,
      weight: 1
    }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarterRouletteComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: GenerationService,
          useValue: {
            getGeneration: () => generationSubject.asObservable()
          }
        },
        {
          provide: PokemonService,
          useValue: {
            getPokemonByIdArray
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarterRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load starters by id for current generation', () => {
    expect(component.starters.map(starter => starter.pokemonId)).toEqual([1, 4, 7, 25, 133]);
  });
});
```

### Utility Function Test
**File:** `src/app/utils/odd-utils.spec.ts`

```typescript
import { interleaveOdds } from './odd-utils';
import { WheelItem } from '../interfaces/wheel-item';

describe('interleaveOdds utility', () => {
  const makeItems = (text: string, count: number): WheelItem[] =>
    Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));

  /** Returns the positions in `result` where item.text === text. */
  function indicesOf(result: WheelItem[], text: string): number[] {
    return result.reduce<number[]>((acc, item, i) => {
      if (item.text === text) acc.push(i);
      return acc;
    }, []);
  }

  /** Consecutive distances between sorted positions. */
  function gapsBetween(indices: number[]): number[] {
    return indices.slice(1).map((v, i) => v - indices[i]);
  }

  /** True when every value is within 1 of every other value. */
  function isEvenlySpread(values: number[]): boolean {
    if (values.length === 0) return true;
    return Math.max(...values) - Math.min(...values) <= 1;
  }

  it('returns all no when yes array is empty', () => {
    const no = makeItems('n', 5);
    expect(interleaveOdds([], no)).toEqual(no);
  });

  it('returns all yes when no array is empty', () => {
    const yes = makeItems('y', 4);
    expect(interleaveOdds(yes, [])).toEqual(yes);
  });

  /** Asserts distribution invariants */
  function assertDistributionInvariants(yesCount: number, noCount: number): void {
    const result = interleaveOdds(makeItems('y', yesCount), makeItems('n', noCount));

    expect(result.length).toBe(yesCount + noCount);
    expect(result.filter(i => i.text === 'y').length).toBe(yesCount);
    expect(result.filter(i => i.text === 'n').length).toBe(noCount);

    const minority = yesCount <= noCount ? 'y' : 'n';
    const gaps = gapsBetween(indicesOf(result, minority));
    expect(isEvenlySpread(gaps)).toBeTrue();
  }

  it('spaces a larger yes list with fewer no items (10 yes, 2 no)', () => {
    assertDistributionInvariants(10, 2);
  });

  it('distributes evenly with 5 yes and 12 no', () => {
    assertDistributionInvariants(5, 12);
  });
});
```

## Mocking

**Framework:** Jasmine SpyObj

**Patterns:**

1. **Spy Objects for Dependencies:**
```typescript
const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
TestBed.configureTestingModule({
  providers: [{ provide: HttpClient, useValue: httpSpyObj }]
});
```

2. **Mock Observables with BehaviorSubject:**
```typescript
const generationSubject = new BehaviorSubject<GenerationItem>({
  text: 'Gen 1',
  region: 'Kanto',
  fillStyle: 'crimson',
  id: 1,
  weight: 1
});

providers: [
  {
    provide: GenerationService,
    useValue: {
      getGeneration: () => generationSubject.asObservable()
    }
  }
]
```

3. **Mock Service Methods:**
```typescript
const getPokemonByIdArray = (pokemonIds: number[]): PokemonItem[] =>
  pokemonIds.map((pokemonId) => ({
    text: `pokemon.${pokemonId}`,
    pokemonId,
    fillStyle: 'black',
    sprite: null,
    shiny: false,
    power: 1,
    weight: 1
  }));

providers: [
  {
    provide: PokemonService,
    useValue: { getPokemonByIdArray }
  }
]
```

**What to Mock:**
- External HTTP dependencies (HttpClient)
- Other services injected via constructor
- Time-dependent functionality (dates, intervals)

**What NOT to Mock:**
- Services being directly tested
- Built-in Angular services (CommonModule, TranslateModule)
- Data fixtures (use test doubles instead)

## Fixtures and Factories

**Test Data:**
- Factory functions for creating test objects
- Used in utility tests and component tests
- Example from `odd-utils.spec.ts`:
```typescript
const makeItems = (text: string, count: number): WheelItem[] =>
  Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));

const getPokemonByIdArray = (pokemonIds: number[]): PokemonItem[] =>
  pokemonIds.map((pokemonId) => ({
    text: `pokemon.${pokemonId}`,
    pokemonId,
    fillStyle: 'black',
    sprite: null,
    shiny: false,
    power: 1,
    weight: 1
  }));
```

**Location:**
- Defined inline within test files (no separate fixtures directory)
- Typically at top of describe block or as constants

## Coverage

**Requirements:** Not enforced

**View Coverage:**
Coverage reports available via Karma Coverage plugin (installed as `karma-coverage: ~2.2.1`).

Run tests to generate coverage reports in `coverage/` directory (default Angular setup).

## Test Types

**Unit Tests:**
- Scope: Individual functions, methods, services, components
- Approach: Isolate functionality with mocks for dependencies
- Examples: `PokemonService.getPokemonByIdArray()`, `interleaveOdds()` utility
- Pattern: Arrange → Act → Assert

**Integration Tests:**
- Scope: Component + injected services (limited integration)
- Approach: Use TestBed to wire components and real services
- Examples: `RouletteContainerComponent` with real `TrainerService`, `GameStateService`
- Pattern: Setup TestBed → Create component → Trigger lifecycle → Assert state

**E2E Tests:**
- Framework: Not used in this codebase
- No Cypress, Protractor, or Playwright configurations detected

## Common Patterns

**Component Creation:**
```typescript
fixture = TestBed.createComponent(MyComponent);
component = fixture.componentInstance;
fixture.detectChanges(); // Trigger ngOnInit
```

**Service Injection:**
```typescript
service = TestBed.inject(MyService);
```

**Observable Testing (in component tests):**
- Subscriptions are tested implicitly by asserting component state after events
- No explicit Observable assertion libraries (RxJS marble testing) observed

**Async Testing:**
- `beforeEach(async () => { ... })` for async setup
- `await TestBed.configureTestingModule(...).compileComponents()` for component tests

**Error Testing:**
- Rare in codebase; no explicit error test patterns detected
- Happy path testing dominant

**Property Access in Tests:**
```typescript
expect(component.starters.map(starter => starter.pokemonId)).toEqual([1, 4, 7, 25, 133]);
```

## Configuration

**Test Configuration File:** `tsconfig.spec.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine", "@angular/localize"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

**Karma Configuration:** `angular.json` (test architect section)
- Polyfills: `zone.js` and `zone.js/testing` for Angular testing utilities
- TS config: `tsconfig.spec.json`
- Assets: Files from `public/` directory
- Styles: `src/styles.css`

---

*Testing analysis: 2025-01-10*
