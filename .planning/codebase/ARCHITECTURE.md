# Architecture

**Analysis Date:** 2025-07-10

## Pattern Overview

**Overall:** Angular 21 standalone-component SPA with a stack-based game state machine

**Key Characteristics:**
- No NgModules — every component is `standalone: true` and declares its own imports
- All services are `providedIn: 'root'` singletons; no module-level providers
- Reactive state via RxJS `BehaviorSubject`/`Subject` exposed as Observables; no NgRx or Signals
- Game progression is driven by a stack in `GameStateService` that is popped once per phase transition
- The spinning wheel is a single reusable Canvas component; every roulette scene is a thin wrapper around it

---

## Layers

**App Shell (`AppComponent`):**
- Purpose: Bootstrap Angular, initialise i18n language, render the router outlet
- Location: `src/app/app.component.ts`
- Contains: `<router-outlet>`, language init via `TranslateService`
- Depends on: `@ngx-translate/core`
- Used by: `src/main.ts` via `bootstrapApplication`

**Routed Page Components:**
- Purpose: Top-level pages mounted by the router
- Locations:
  - `src/app/main-game/main-game.component.ts` — `/`
  - `src/app/credits/credits.component.ts` — `/credits`
  - `src/app/coffee/coffee.component.ts` — `/coffee`
  - `src/app/settings/settings.component.ts` — `/settings`
  - `src/app/not-found/not-found.component.ts` — `**`
- Contains: Layout, orchestration; delegate logic to services and child components
- Depends on: Services, child feature components

**Roulette Orchestrator (`RouletteContainerComponent`):**
- Purpose: Renders the correct roulette scene for the current `GameState`; wires all Output events from roulette scenes back into `GameStateService`
- Location: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Contains: `@if`/`@switch` over `gameStateService.currentState`; imports all 28+ roulette scene components
- Depends on: `GameStateService`, `TrainerService`, `PokemonService`, `EvolutionService`, `ItemsService`, `PokedexService`, `PokemonFormsService`, `RareCandyService`, `ModalQueueService`, `SoundFxService`, `SettingsService`
- Used by: `MainGameComponent`

**Roulette Scene Components (28 total):**
- Purpose: Each encapsulates one game-state's wheel items, weights, and outcome events
- Location: `src/app/main-game/roulette-container/roulettes/*/`
- Contains: A `WheelItem[]` array, `WheelComponent`, and `@Output()` EventEmitters for each outcome
- Depends on: `WheelComponent`, `GenerationService`, static data files co-located in the same directory
- Used by: `RouletteContainerComponent` exclusively

**WheelComponent (shared primitive):**
- Purpose: Canvas-based spinning wheel; accepts `WheelItem[]` via `@Input()`, emits winning index via `@Output() selectedItemEvent`
- Location: `src/app/wheel/wheel.component.ts`
- Contains: Canvas drawing, weighted random selection, eased animation via `requestAnimationFrame`, spacebar listener, sound integration
- Depends on: `DarkModeService`, `GameStateService` (sets `wheelSpinning` flag), `SoundFxService`, `TranslateService`
- Used by: All roulette scene components

**Services Layer:**
- Purpose: Business logic, cross-component state, external I/O
- Location: `src/app/services/*/`
- Contains: Injectable singletons; see "Key Abstractions" for detail
- Depends on: Each other (see dependency tree below); `HttpClient` for external API calls

**Trainer-Team Display:**
- Purpose: Right-side panel showing trainer sprite, active team (≤6), stored Pokémon (PC), badges, and Pokédex
- Location: `src/app/trainer-team/trainer-team.component.ts`
- Contains: `BadgesComponent`, `StoragePcComponent`, `PokedexComponent` (sub-panels)
- Depends on: `TrainerService`, `DarkModeService`

**Items Panel:**
- Purpose: Displays trainer's item bag; handles Rare Candy click interrupt
- Location: `src/app/items/items.component.ts`
- Depends on: `TrainerService`

---

## Data Flow

**Normal Spin → Outcome:**
1. User clicks Spin (or presses Space) in `WheelComponent` (`src/app/wheel/wheel.component.ts`)
2. `WheelComponent` runs weighted random selection → `requestAnimationFrame` animation → emits `selectedItemEvent(index: number)`
3. Active roulette scene component receives index via `(selectedItemEvent)="onItemSelected($event)"` → emits a semantic `@Output()` event (e.g., `catchPokemonEvent`)
4. `RouletteContainerComponent` handles the output → calls services (e.g., `trainerService.addToTeam()`) → calls `gameStateService.finishCurrentState()` which pops the next `GameState` off the stack
5. `GameStateService.currentState` BehaviorSubject fires → `RouletteContainerComponent` template `@if` guards swap in the next roulette scene

**Game State Machine:**
- `GameStateService` pre-loads a stack (`stateStack: GameState[]`) representing the full playthrough (character-select → 8 gym-battle cycles → elite four × 4 → champion → game-finish)
- `finishCurrentState()` pops the top of the stack and broadcasts it
- `setNextState()` / `repeatCurrentState()` push additional states mid-game (e.g., multi-catch, shiny check)
- `resetGameState()` rebuilds the stack from scratch

**State Management:**
- `GameStateService`: `currentState$` (BehaviorSubject\<GameState\>), `currentRound$`, `wheelSpinning$`
- `TrainerService`: `trainerTeamObservable` (BehaviorSubject\<PokemonItem[]\>), `trainerItemsObservable`, `trainerBadgesObservable`, `trainer` (sprite)
- `GenerationService`: `generation` (BehaviorSubject\<GenerationItem\>)
- `SettingsService`: `settingsSubject$` (BehaviorSubject\<GameSettings\>), persisted to `localStorage`
- `DarkModeService`: `darkModeSubject$` (BehaviorSubject\<boolean\>), persisted to `localStorage`
- `RareCandyService`: `rareCandyTriggerSubject` (Subject\<ItemItem\>) — interrupt bus between `ItemsComponent` and `RouletteContainerComponent`
- `ModalQueueService`: internal Promise chain ensuring NgBootstrap modals open sequentially

---

## Key Abstractions

**`WheelItem` interface (base type):**
- Purpose: Every item that can appear on a wheel segment
- Location: `src/app/interfaces/wheel-item.ts`
- Fields: `text: string`, `fillStyle: string`, `weight: number`
- Extended by: `GenerationItem` (`src/app/interfaces/generation-item.ts`), `PokemonItem` (`src/app/interfaces/pokemon-item.ts`), `ItemItem` (`src/app/interfaces/item-item.ts`)

**`PokemonItem` interface:**
- Purpose: Represents a Pokémon that can appear on a wheel or be on the trainer's team
- Location: `src/app/interfaces/pokemon-item.ts`
- Fields: `pokemonId`, `type1`, `type2`, `sprite` (null until fetched), `shiny`, `power`

**`GameState` union type:**
- Purpose: Exhaustive list of all game states; drives template guard in `RouletteContainerComponent`
- Location: `src/app/services/game-state-service/game-state.ts`
- 31 states including: `character-select`, `starter-pokemon`, `catch-pokemon`, `gym-battle`, `elite-four-battle`, `champion-battle`, `game-finish`, `game-over`

**`EventSource` union type:**
- Purpose: Tags the origin of an evolution or battle event
- Location: `src/app/main-game/EventSource.ts`
- Values: `battle-trainer`, `gym-battle`, `visit-daycare`, `team-rocket-encounter`, `snorlax-encounter`, `battle-rival`, `rare-candy`

**Static data files (co-located with services/roulettes):**
- `src/app/services/pokemon-service/national-dex-pokemon.ts` — full Pokédex as `PokemonItem[]`
- `src/app/services/evolution-service/evolution-chain.ts` — `Record<pokemonId, evolutionId[]>`
- `src/app/main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation.ts` — Pokémon IDs per gen
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/starter-roulette/starter-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/legendary-roulette/legendaries-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/cave-pokemon-roulette/cave-pokemon-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/fishing-roulette/fish-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/fossil-roulette/fossil-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/rival-battle-roulette/rival-by-generation.ts`

---

## Entry Points

**`src/main.ts`:**
- Triggers: Browser load
- Responsibilities: Calls `bootstrapApplication(AppComponent, appConfig)`

**`src/app/app.config.ts`:**
- Triggers: Imported by `main.ts`
- Responsibilities: Registers `provideRouter(routes)`, `provideHttpClient()`, `provideIcons(...)`, `TranslateModule` with `TranslateHttpLoader` (loads `./assets/i18n/{lang}.json`), `provideZoneChangeDetection`

**`src/app/app.routes.ts`:**
- Routes:
  - `''` → `MainGameComponent`
  - `'credits'` → `CreditsComponent`
  - `'coffee'` → `CoffeeComponent`
  - `'settings'` → `SettingsComponent`
  - `'**'` → `NotFoundComponent`

---

## Error Handling

**Strategy:** Localised; no global error handler.

**Patterns:**
- `PokemonService.getPokemonSprites()` uses `retry({ count: 3, delay: 1000 })` and `catchError` — logs to console and re-throws
- `SettingsService` and `DarkModeService` wrap `JSON.parse` of localStorage in try/catch; fall back to defaults silently
- `SoundFxService.playSoundFx()` returns `false` on failure rather than throwing; all audio errors are silent
- `ModalQueueService` catches dismissed modal results so the queue drains cleanly

---

## Cross-Cutting Concerns

**Localisation:** `@ngx-translate/core` with `TranslateHttpLoader`; JSON files in `src/assets/i18n/` for en, es, fr, de, it, pt. Language persisted to `localStorage('language')`. All wheel item `text` values are i18n keys.

**Dark Mode:** `DarkModeService` (`src/app/services/dark-mode-service/dark-mode.service.ts`) adds/removes CSS classes on `document.body`; respects `prefers-color-scheme`; persisted to `localStorage`.

**Analytics:** `AnalyticsService` (`src/app/services/analytics-service/analytics.service.ts`) wraps Google Analytics `gtag`. Called at component `ngOnInit` for page views and key game events.

**Audio:** `SoundFxService` (`src/app/services/sound-fx-service/sound-fx.service.ts`) uses Web Audio API with decoded-buffer caching. Assets served from `public/` (`click.mp3`, `ItemFound.mp3`, `PCTurningOn.mp3`, `PCLogin.mp3`, `PCLogout.mp3`). Muted by `SettingsService.muteAudio`.

**PokeAPI Integration:** `PokemonService` calls `https://pokeapi.co/api/v2/pokemon/{id}` lazily (only when a sprite is missing). `BadgesService` and `ItemSpriteService` also call PokeAPI for badge and item sprites.

**Modal coordination:** `ModalQueueService` wraps `NgbModal` with a Promise-chain queue so only one NgBootstrap modal is open at a time.

---

*Architecture analysis: 2025-07-10*
