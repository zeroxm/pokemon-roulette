# Coding Conventions

**Analysis Date:** 2025-01-31

## Code Style

- **Indentation:** 2 spaces (enforced via `.editorconfig`)
- **Quotes:** Single quotes for TypeScript strings (`quote_type = single` in `.editorconfig`)
- **Trailing whitespace:** Trimmed automatically (`.editorconfig`)
- **Final newline:** Required on all files
- **TypeScript strict mode:** Enabled — `strict: true`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature` all active (`tsconfig.json`)
- **Angular strict templates:** `strictTemplates: true`, `strictInjectionParameters: true` (`tsconfig.json`)

## Naming

**Variables:**
- camelCase: `private stateStack`, `currentRound`, `wheelSpinning`
- Boolean observables/state use descriptive names: `wheelSpinning`, `showChoiceButtons`
- Subjects end with `$` suffix: `private settingsSubject$: BehaviorSubject<GameSettings>` (`src/app/services/settings-service/settings.service.ts`)
- Observables exposed publicly drop the `$` or end with `Observable`/`Observer`: `currentState`, `currentRoundObserver`, `settings$` (mixed pattern)

**Functions/Methods:**
- camelCase: `finishCurrentState()`, `toggleMuteAudio()`, `getPokemonByIdArray()`
- Event handlers prefixed with `on`: `onItemSelected()`, `onGenerationChosen()`
- Boolean toggles use `toggle` prefix: `toggleMuteAudio()`, `toggleSkipShinyRolls()`
- Private methods use `private` keyword, not underscore convention

**Classes:**
- PascalCase: `GameStateService`, `RouletteContainerComponent`, `PokemonService`

**Interfaces:**
- PascalCase, no `I` prefix: `WheelItem`, `PokemonItem`, `GameSettings`
- Interfaces in `src/app/interfaces/` directory with one interface per file

**Files:**
- kebab-case with Angular type suffix:
  - Components: `pokemon-service.component.ts` / `.html` / `.css` / `.spec.ts`
  - Services: `game-state.service.ts` / `.spec.ts`
  - Interfaces: `pokemon-item.ts`, `wheel-item.ts`
  - Data files: `national-dex-pokemon.ts`, `area-zero-pokemon.ts`
  - Type unions: `game-state.ts`, `event-source.ts` (exported as `type`)

**Constants:**
- Class-level constants: `UPPER_SNAKE_CASE` — `NINCADA_ID = 290` (`src/app/main-game/roulette-container/roulette-container.component.ts`)
- `private readonly` for class-level config strings: `private readonly STORAGE_KEY = 'pokemon-roulette-settings'`
- `private readonly apiBaseUrl = '...'` for URLs

**Type aliases:**
- PascalCase: `export type PokemonType = ...`, `export type GameState = ...`, `export type EventSource = ...`

## Angular-Specific Patterns

**Standalone Components:** All components use `standalone: true` with direct `imports: []` array — no NgModules used anywhere. (`src/app/app.component.ts`, all roulette components)

**Dependency Injection — Constructor:** Primary pattern for services:
```typescript
constructor(private gameStateService: GameStateService,
            private pokemonService: PokemonService) { }
```
(`src/app/main-game/roulette-container/roulette-container.component.ts`)

**Dependency Injection — `inject()`:** Used only for `DestroyRef` (not for services):
```typescript
private destroyRef = inject(DestroyRef);
```
(`src/app/main-game/roulette-container/roulette-container.component.ts`)

**Services:** All services use `@Injectable({ providedIn: 'root' })` — application-scoped singletons, no lazy-loading providers.

**Subscriptions:** `takeUntilDestroyed(this.destroyRef)` for declarative cleanup; explicit `.unsubscribe()` only when a `Subscription` reference is needed for conditional logic:
```typescript
this.gameStateService.currentState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...)
private rareCandySubscription?: Subscription;
// then: this.rareCandySubscription?.unsubscribe();
```

**Component Outputs:** `@Output()` with `EventEmitter<T>` naming: event + `Event` suffix:
```typescript
@Output() generationSelectedEvent = new EventEmitter<GenerationItem>();
@Output() resetGameEvent = new EventEmitter<void>();
```

**i18n:** `@ngx-translate/core` — use `TranslatePipe` in imports array and `translate` pipe in templates. Language stored to `localStorage` with key `'language'`.

**Lifecycle Hooks:** Implement `OnInit`/`OnDestroy` interfaces explicitly when lifecycle methods are used.

## State Management Pattern

Services use `BehaviorSubject` for reactive state with a private subject and public observable:
```typescript
// settings.service.ts
private settingsSubject$: BehaviorSubject<GameSettings>;

get settings$(): Observable<GameSettings> {
  return this.settingsSubject$.asObservable().pipe(distinctUntilChanged());
}

get currentSettings(): GameSettings {
  return this.settingsSubject$.getValue();
}
```

State mutations create new objects (immutable update pattern):
```typescript
const newSettings = { ...currentSettings, muteAudio: !currentSettings.muteAudio };
this.updateSettings(newSettings);
```

## Error Handling

**RxJS pipelines:** `catchError` with `throwError(() => new Error(...))` and `retry()` for HTTP calls:
```typescript
// src/app/services/pokemon-service/pokemon.service.ts
return this.http.get<any>(url).pipe(
  retry({ count: 3, delay: 1000 }),
  map((response) => ({ sprite: response.sprites.other['official-artwork'] })),
  catchError((error) => {
    console.error(`Failed to fetch Pokémon ${pokemonId}:`, error);
    return throwError(() => new Error('Failed to fetch Pokémon data'));
  })
);
```

**localStorage parsing:** `try/catch` around `JSON.parse` with `console.error` logging and graceful fallback to default/empty state:
```typescript
// src/app/services/settings-service/settings.service.ts
try {
  return JSON.parse(storageItem);
} catch (error) {
  console.error('Invalid settings localStorage item:', storageItem, 'falling back to default settings');
}
return null;
```

**Optional chaining:** Used for nullable subscriptions and optional properties: `this.rareCandySubscription?.unsubscribe()`.

**Logging:** `console.error()` only — no structured logging library.

## Common Patterns

### Interface Inheritance (WheelItem base)
All game item types extend `WheelItem` from `src/app/interfaces/wheel-item.ts`:
```typescript
export interface WheelItem { text: string; fillStyle: string; weight: number; }
export interface PokemonItem extends WheelItem { pokemonId: number; sprite: {...} | null; ... }
export interface GenerationItem extends WheelItem { id: number; region: string; ... }
```
Files: `src/app/interfaces/*.ts`

### Event-Driven State Machine
Game state flows through `GameStateService` as a stack-based state machine with `BehaviorSubject`. Roulette components emit events, container component advances state.
File: `src/app/services/game-state-service/game-state.service.ts`

### Stack-Based State Navigation
`stateStack: GameState[]` — states pushed/popped to control game flow. `finishCurrentState()` pops and emits next state via `BehaviorSubject`.

### JSDoc Comments
Used for public API methods, especially in services:
```typescript
/**
 * Fetches the sprites for a given Pokémon by ID.
 * @param pokemonId The ID of the Pokémon.
 * @returns An Observable of the sprite URLs.
 */
```
File: `src/app/services/pokemon-service/pokemon.service.ts`

### Deep Cloning
`structuredClone()` used for defensive copying of game objects (prevents shared reference bugs):
```typescript
service.trainerTeam = [structuredClone(palafinZero), structuredClone(bulbasaur)];
```

### Type-Safe Filter Guards
Inline type predicates used with `.filter()`:
```typescript
.filter((pokemon): pokemon is PokemonItem => pokemon !== undefined)
```
File: `src/app/services/pokemon-service/pokemon.service.ts`

---

*Convention analysis: 2025-01-31*
