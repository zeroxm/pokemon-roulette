# Coding Conventions

**Analysis Date:** 2025-07-14

## Naming Patterns

**Files:**
- Components: `kebab-case.component.ts` / `.html` / `.css` — e.g., `generation-roulette.component.ts`
- Services: `kebab-case.service.ts` — e.g., `game-state.service.ts`
- Specs: co-located with source, `*.component.spec.ts` / `*.service.spec.ts` — e.g., `trainer.service.spec.ts`
- Interfaces: `kebab-case.ts` in `src/app/interfaces/` — e.g., `pokemon-item.ts`
- Data files: `kebab-case-data.ts` or descriptive names — e.g., `national-dex-pokemon.ts`, `starter-by-generation.ts`
- Type alias files: `game-state.ts` (bare noun, no suffix)
- One exception: `restart-game-buttom/` (typo in directory/component name, preserved as-is)

**Classes / Components / Services:**
- PascalCase — e.g., `GenerationRouletteComponent`, `GameStateService`, `TrainerService`

**Functions and Methods:**
- camelCase — e.g., `onItemSelected()`, `setNextState()`, `resetGameState()`, `toggleChoiceView()`
- Event handler methods prefixed with `on` — e.g., `onItemSelected(index)`, `onGenerationChosen(index)`
- Action methods use imperative verbs — e.g., `spinWheel()`, `addToTeam()`, `removeFromTeam()`, `makeShiny()`
- Private helpers use descriptive names — e.g., `initializeStates()`, `syncBattleForms()`, `loadPokemonSpriteIfMissing()`

**Variables / Properties:**
- camelCase — e.g., `wheelSpinning`, `trainerTeam`, `selectedGeneration`
- Boolean fields use descriptive past or present participles — e.g., `mapIsCollapsed`, `showChoiceButtons`, `spinning`
- Observables suffixed with `$` in some services — e.g., `darkMode$`, `pokedex$`, `darkModeSubject$`
- Observable-returning properties named with `Observer` suffix in other services — e.g., `wheelSpinningObserver`, `currentRoundObserver` (inconsistent — see below)

**Interfaces:**
- PascalCase in dedicated files — e.g., `PokemonItem`, `WheelItem`, `GenerationItem`
- Use `extends` to compose — e.g., `PokemonItem extends WheelItem`, `GenerationItem extends WheelItem`

**Types:**
- Union type aliases in bare `.ts` files — e.g., `GameState` in `src/app/services/game-state-service/game-state.ts`

**Selectors:**
- All `app-` prefixed — e.g., `app-generation-roulette`, `app-main-game`, `app-wheel`

**Event emitters:**
- Named with `Event` suffix on the `@Output()` — e.g., `generationSelectedEvent`, `selectedStarterEvent`, `selectedPokemonEvent`

## Code Style

**Formatting:**
- EditorConfig enforced via `.editorconfig`
- 2-space indentation for all files
- UTF-8 encoding
- Single quotes for TypeScript strings (`quote_type = single`, `ij_typescript_use_double_quotes = false`)
- Trailing newline required (`insert_final_newline = true`)
- No trailing whitespace (`trim_trailing_whitespace = true`)

**Linting:**
- No ESLint or Prettier config detected — formatting is handled by EditorConfig only
- TypeScript compiler enforces strict mode (see TypeScript section below)

## TypeScript Usage

**Strict Mode:** Fully enabled in `tsconfig.json`:
```json
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Angular compiler strict options:**
```json
{
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true
}
```

**Target:** ES2022, module: ES2022

**`any` usage:** Minimal and intentional:
- `http.get<any>()` in `pokemon.service.ts` for untyped API response before mapping
- `TemplateRef<any>` for `@ViewChild` modal refs (Angular-idiomatic)
- `declare var gtag: any` in `analytics.service.ts` for global Google Analytics script
- `// @ts-ignore` used twice — both for `dom-to-image-more` which lacks type declarations:
  - `src/app/main-game/end-game/end-game.component.ts`
  - `src/app/main-game/game-over/game-over.component.ts`

**Non-null assertion (`!`):** Used where Angular guarantees initialization (`@ViewChild`) — e.g., `wheelCanvas!: HTMLCanvasElement`

**`readonly`:** Applied on private service fields that are set once — e.g., `private readonly options`, `private readonly renderer`, `private readonly battleStates`, `private readonly spriteCache`

**`private` vs no modifier:**
- Services consistently use `private` for internal BehaviorSubjects and helpers
- Components often expose properties without access modifier (public by default) for template binding

## Angular Patterns

**Component Architecture: Standalone (Angular 14+)**
- Every component uses `standalone: true` (implicit in Angular 19 — no `NgModule` exists in the codebase)
- `imports` array on `@Component` lists direct dependencies — no shared modules
- Example pattern:
  ```typescript
  @Component({
    selector: 'app-generation-roulette',
    imports: [CommonModule, WheelComponent, TranslatePipe],
    templateUrl: './generation-roulette.component.html',
    styleUrl: './generation-roulette.component.css'
  })
  ```

**No Angular Signals:** The codebase uses RxJS `BehaviorSubject` / `Observable` exclusively for reactive state — no `signal()`, `computed()`, or `effect()` are used anywhere.

**Dependency Injection:**
- Primary pattern: constructor injection
  ```typescript
  constructor(private generationService: GenerationService, private darkModeService: DarkModeService) { }
  ```
- Exception: `inject()` function used in `LanguageSelectorComponent` for one dependency:
  ```typescript
  private translateService = inject(TranslateService);
  ```
- All services use `@Injectable({ providedIn: 'root' })` — no module-scoped providers

**Lifecycle Hooks:**
- `OnInit` / `ngOnInit()` — subscription setup, observable subscriptions (114 uses across the codebase)
- `OnDestroy` / `ngOnDestroy()` — subscription cleanup via `.unsubscribe()`
- `AfterViewInit` / `ngAfterViewInit()` — DOM access (`document.getElementById()`) for canvas elements

**Event Communication:**
- Parent→child: `@Input()` properties
- Child→parent: `@Output() EventEmitter` (decorated with `@Output()`, named with `Event` suffix)
- Sibling/global: RxJS `BehaviorSubject` in services, subscribed via `.asObservable()`

**Modal Pattern:**
- Uses `@ng-bootstrap/ng-bootstrap` `NgbModal`
- `@ViewChild('modalRef', { static: true }) modal!: TemplateRef<any>` pattern throughout
- Opened via `NgbModal.open(this.myModal)` in component methods

**State Management:**
- `BehaviorSubject`-backed services; state exposed as `Observable` via `.asObservable()`
- `GameStateService` manages a stack-based state machine (`GameState` union type) with a `BehaviorSubject<GameState>`
- Components subscribe to observables in `ngOnInit` and store subscriptions for cleanup
- `Observable<boolean>` used directly as template input via `| async` pipe

**`styleUrl` (singular):** All components use the Angular 17+ singular `styleUrl` (not the older `styleUrls` array):
```typescript
styleUrl: './generation-roulette.component.css'
```

## Import Organization

**Order (observed pattern):**
1. Angular core and platform (`@angular/core`, `@angular/common`, `@angular/router`, etc.)
2. Third-party libraries (`@ng-bootstrap/ng-bootstrap`, `@ng-icons/core`, `@ngx-translate/core`, `rxjs`)
3. Internal components (relative paths, sibling/child directories)
4. Internal services (relative paths, `../services/...`)
5. Internal interfaces (relative paths, `../interfaces/...`)
6. Internal data files (relative paths, same-directory data constants)

**No path aliases:** All imports use relative paths — no `@app/...` or similar aliases configured.

## Comments

**When to Comment:**
- JSDoc-style comments on public service methods and complex algorithms — e.g., `PokemonService.getPokemonSprites()`, `interleaveSortedOdds()`
- Inline comments explain non-obvious logic — e.g., Bresenham algorithm in `odd-utils.ts`, battle form transform logic in `trainer.service.ts`
- `// @ts-ignore` is acceptable only for missing third-party type declarations
- `TODO(next-task cleanup):` format used for tracked technical debt items — e.g., in `pokedex.service.ts`

**JSDoc format example:**
```typescript
/**
 * Fetches the sprites for a given Pokémon by ID.
 * @param pokemonId The ID of the Pokémon.
 * @returns An Observable of the sprite URLs.
 */
getPokemonSprites(pokemonId: number): Observable<...>
```

## Code Organization Patterns

**Feature folders by domain:**
- Each roulette game state has its own directory under `src/app/main-game/roulette-container/roulettes/`
- Data constants co-located with the feature that uses them — e.g., `starter-by-generation.ts` next to `starter-roulette.component.ts`

**Service responsibilities:**
- Services are single-responsibility and inject other services freely
- Data files (`-data.ts`) export plain object/array constants, imported directly into services

**Utilities:**
- Pure functions placed in `src/app/utils/` — e.g., `odd-utils.ts`
- No barrel `index.ts` files — all imports are direct file paths

**`structuredClone()`:** Used throughout `trainer.service.ts` to deep-clone Pokémon before mutating, preventing shared-reference bugs

---

*Convention analysis: 2025-07-14*
