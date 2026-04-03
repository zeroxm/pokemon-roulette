# Architecture

**Analysis Date:** 2024-01-15

## Pattern Overview

**Overall:** State Machine with Component-based Roulette System

**Key Characteristics:**
- Linear game progression controlled by `GameStateService` state stack
- 25+ specialized roulette components for different game scenarios
- Reusable wheel component with canvas-based rendering and weighted probability system
- Reactive Observable-based state management using RxJS
- Standalone component architecture (no NgModules)

## Layers

**Presentation Layer:**
- Purpose: Render game UI, display roulettes, and handle user interactions
- Location: `src/app/` (component tree)
- Contains: Angular components, templates, and CSS
- Depends on: Services, interfaces, shared components
- Used by: User through browser

**Component Hierarchy:**
- `AppComponent` (`src/app/app.component.ts`) - Root component managing i18n and routing
  - `MainGameComponent` (`src/app/main-game/main-game.component.ts`) - Central game controller
    - `RouletteContainerComponent` (`src/app/main-game/roulette-container/roulette-container.component.ts`) - Router for 25+ roulettes
      - Individual Roulette Components (e.g., `StarterRouletteComponent`, `GymBattleRouletteComponent`)
    - `TrainerTeamComponent` (`src/app/trainer-team/trainer-team.component.ts`) - Display player's Pokemon team
    - `ItemsComponent` (`src/app/items/items.component.ts`) - Display collected items
    - `WheelComponent` (`src/app/wheel/wheel.component.ts`) - Reusable spinning wheel renderer

**Services Layer (Business Logic):**
- Purpose: Manage game state, data, and cross-cutting concerns
- Location: `src/app/services/` (organized by domain)
- Contains: Services for state, Pokemon, items, training, evolution, badges
- Depends on: Interfaces, external APIs (PokeAPI), browser APIs
- Used by: Components, other services

**Key Services:**
- `GameStateService` (`src/app/services/game-state-service/`) - State machine controller
- `PokemonService` (`src/app/services/pokemon-service/`) - Pokemon data and PokeAPI integration
- `TrainerService` (`src/app/services/trainer-service/`) - Team management and battle tracking
- `ItemsService` (`src/app/services/items-service/`) - In-game items management
- `EvolutionService` (`src/app/services/evolution-service/`) - Pokemon evolution logic
- `DarkModeService` (`src/app/services/dark-mode-service/`) - Theme switching with localStorage
- `SettingsService` (`src/app/services/settings-service/`) - Game configuration
- `GenerationService` (`src/app/services/generation-service/`) - Pokemon generation selection
- `BadgesService` (`src/app/services/badges-service/`) - Gym badge collection
- `AnalyticsService` (`src/app/services/analytics-service/`) - Event tracking
- `SoundFxService` (`src/app/services/sound-fx-service/`) - Audio playback
- `ModalQueueService` (`src/app/services/modal-queue-service/`) - Modal dialog queue management
- `PokemonFormsService` (`src/app/services/pokemon-forms-service/`) - Form variant handling

**Data Layer (Models & Interfaces):**
- Purpose: Type definitions for game entities
- Location: `src/app/interfaces/`
- Contains: TypeScript interfaces for wheel items, Pokemon, items, badges, etc.

**Core Interfaces:**
- `WheelItem` (`src/app/interfaces/wheel-item.ts`) - Base for all roulette items
- `PokemonItem` (`src/app/interfaces/pokemon-item.ts`) - Pokemon with sprite and power level
- `ItemItem` (`src/app/interfaces/item-item.ts`) - In-game item data
- `GenerationItem` (`src/app/interfaces/generation-item.ts`) - Pokemon generation definition
- `GymLeader` (`src/app/interfaces/gym-leader.ts`) - Gym leader battle data
- `Badge` (`src/app/interfaces/badge.ts`) - Badge collection data
- `PokemonForm` (`src/app/interfaces/pokemon-form.ts`) - Form variant definition

**Utility Layer:**
- Purpose: Reusable helper functions
- Location: `src/app/utils/` and scattered helper files
- Contains: Utility functions (e.g., `odd-utils.ts` for probability calculations)

## Data Flow

**Game Initialization:**
1. `main.ts` → bootstraps `AppComponent`
2. `AppComponent` initializes i18n (TranslateService)
3. Routes to `MainGameComponent` (default route)
4. `MainGameComponent` initializes services and renders layout

**Game Round Flow:**
1. `MainGameComponent` displays `RouletteContainerComponent`
2. `RouletteContainerComponent` subscribes to `GameStateService.currentState`
3. Current game state determines which roulette component to display (ngSwitch)
4. Selected roulette component emits outcome event
5. `RouletteContainerComponent` handles outcome, updates game state
6. `GameStateService` pops next state from stack and emits new state
7. UI re-renders based on new state

**Wheel Spin Sequence:**
1. Roulette component passes `WheelItem[]` to `WheelComponent`
2. `WheelComponent.ngAfterViewInit` preprocesses translations
3. `drawWheel()` renders wheel segments on canvas (HTML5 2D context)
4. User clicks wheel or spins with weighted probability selected
5. `WheelComponent` emits `selectedItemEvent` with index
6. Parent roulette component handles selection and emits game-specific event
7. `RouletteContainerComponent` processes outcome

**State Management:**
- `GameStateService` maintains a stack of game states
- Each spin consumes a state from the stack
- `initializeStates()` pre-populates the stack with the full game flow
- Stack order determines game progression (e.g., character select → starter → gym battles)
- `finishCurrentState()` moves to next state in stack
- `repeatCurrentState()` re-runs current state (e.g., for item effects)

**Event Flow with Services:**

```
Roulette Component
    ↓ (emits selected item)
RouletteContainerComponent
    ↓ (handles outcome)
Services (Pokemon, Trainer, Items, etc.)
    ↓ (update state)
GameStateService
    ↓ (emits new state via currentState Observable)
RouletteContainerComponent
    ↓ (subscribes, re-renders next roulette)
```

## Key Abstractions

**WheelItem Hierarchy:**
- Purpose: Polymorphic base for all roulette selections
- Base: `WheelItem` (text, fillStyle, weight)
- Subclasses:
  - `PokemonItem` - Extends WheelItem, adds pokemonId, sprite, shiny, power
  - `ItemItem` - Extends WheelItem, adds itemId, itemType, sprite
  - `GymLeader` - Extends WheelItem, adds leader name and generation
  - `Badge` - Extends WheelItem, adds badge ID and generation
- Pattern: Used in all roulette components to define wheel segments

**Roulette Component Pattern:**
- Purpose: Standardized interface for all game decision wheels
- Pattern: Each roulette component:
  1. Receives generation selection from `GenerationService` (via subscription)
  2. Fetches appropriate items from data source (Pokemon, items, etc.)
  3. Emits selected item via `@Output` EventEmitter
  4. Parent (`RouletteContainerComponent`) handles outcome

**Examples:**
- `StarterRouletteComponent` - Lists starters for selected generation
- `GymBattleRouletteComponent` - Lists gym leaders for generation
- `PokemonFromGenerationRouletteComponent` - Lists catchable Pokemon for generation

**Game State Machine:**
- Purpose: Control game progression
- Implementation: Stack-based state machine in `GameStateService`
- States: ~30 distinct game states (game-start, character-select, starter-pokemon, gym-battle, etc.)
- Transitions: Linear progression through pre-ordered state stack
- State types: Located in `src/app/services/game-state-service/game-state.ts`

**Probability System:**
- Purpose: Weighted random selection for all roulette outcomes
- Implementation: Each `WheelItem` has a `weight` property
- Algorithm: Canvas-based wheel segments scaled by weight; random angle selects segment
- Pattern: Used across all roulette components for fair randomization

## Entry Points

**Application Entry Point:**
- Location: `src/main.ts`
- Triggers: Application startup
- Responsibilities: Bootstraps `AppComponent` with `appConfig`

**Root Component:**
- Location: `src/app/app.component.ts`
- Selector: `app-root`
- Triggers: When app loads
- Responsibilities:
  - Initialize i18n (TranslateService with 6 languages: EN, ES, FR, DE, IT, PT)
  - Load saved language from localStorage
  - Provide RouterOutlet for page routing

**Main Game Component:**
- Location: `src/app/main-game/main-game.component.ts`
- Route: `/` (default)
- Triggers: Application navigation to home
- Responsibilities:
  - Initialize all game services
  - Manage layout (team panel, items panel, roulette, buttons)
  - Subscribe to game state and dark mode
  - Handle settings, team management, item usage

**Roulette Router:**
- Location: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Triggers: Game state changes
- Responsibilities:
  - Subscribe to `GameStateService.currentState`
  - Use ngSwitch to render appropriate roulette component
  - Handle roulette outcomes (catch Pokemon, find items, battle results, etc.)
  - Manage modal dialogs for evolution, trades, battles
  - Update `TrainerService` and `ItemsService` with outcomes

## Error Handling

**Strategy:** Try-catch with graceful fallbacks and error logging

**Patterns:**

**HTTP Requests (PokeAPI):**
- Location: `src/app/services/pokemon-service/pokemon.service.ts`
- Implementation: RxJS `catchError` with retry logic
  ```typescript
  getPokemonSprites(pokemonId: number): Observable<...> {
    return this.http.get<any>(url).pipe(
      retry({ count: 3, delay: 1000 }),
      map(...),
      catchError((error) => {
        console.error(`Failed to fetch Pokémon ${pokemonId}:`, error);
        return throwError(() => new Error('Failed to fetch Pokémon data'));
      })
    );
  }
  ```

**Modal Error Handling:**
- Location: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Implementation: Modal queue ensures dialogs display in order without blocking

**Service Initialization:**
- Fallback: All services provide root injection with `providedIn: 'root'`
- Ensures services are singletons and available application-wide

## Cross-Cutting Concerns

**Logging:** 
- Approach: console.log/error directly in services
- Location: PokeAPI errors, game state transitions
- Example: `console.error('Failed to fetch Pokémon...')`

**Validation:**
- Pokemon existence: `PokemonService.getPokemonById()` returns `undefined` if not found
- Array safety: Filter functions check bounds (e.g., `filter((pokemon): pokemon is PokemonItem => pokemon !== undefined)`)
- State validation: `GameStateService` maintains ordered stack to prevent invalid transitions

**Authentication:** 
- Not applicable (client-side game, no authentication required)

**Internationalization (i18n):**
- Approach: ngx-translate with JSON translation files
- Location: `src/assets/i18n/` (EN, ES, FR, DE, IT, PT)
- Implementation:
  - `AppComponent` loads saved language from localStorage
  - `WheelComponent` preprocesses translations for performance
  - `TranslatePipe` used throughout templates for dynamic text
  - Language switching stored in localStorage

**Theme Management:**
- Approach: Observable-based dark mode toggle
- Location: `src/app/services/dark-mode-service/dark-mode.service.ts`
- Implementation: Detects system preference, stores preference in localStorage
- Used by: Components subscribe to `darkMode$` Observable for CSS class binding

**Sound Effects:**
- Approach: HTML5 Audio API wrapper
- Location: `src/app/services/sound-fx-service/sound-fx.service.ts`
- Types: Click sounds, item found sounds
- Implementation: Service manages audio playback with configurable volume

**Analytics:**
- Approach: Event tracking service
- Location: `src/app/services/analytics-service/analytics.service.ts`
- Events: Game loaded, events tracked for user engagement
- Implementation: Service wraps analytics calls (Google Analytics or similar)

---

*Architecture analysis: 2024-01-15*
