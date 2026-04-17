# Architecture

**Analysis Date:** 2025-01-31

## Pattern Overview

**Overall:** Angular Standalone Component architecture with reactive state management via RxJS BehaviorSubjects. The application follows a service-driven state machine pattern where `GameStateService` controls a stack-based game progression.

**Key Characteristics:**
- Standalone components (no NgModules) — Angular 21 idiom
- Services as single source of truth via `BehaviorSubject` observables
- State machine pattern: pre-defined stack of `GameState` values popped sequentially
- Event-driven roulette outcomes: child roulette components emit typed `EventEmitter` outputs to parent orchestrator
- External data fetched from PokeAPI; internal data bundled as local TypeScript arrays

## Entry Points

- `src/main.ts` — Application bootstrap using `bootstrapApplication(AppComponent, appConfig)`
- `src/app/app.config.ts` — Provider registration: router, HTTP client, i18n (ngx-translate), icons (ng-icons), zone change detection
- `src/app/app.routes.ts` — Route definitions (4 routes + wildcard)
- `src/index.html` — HTML shell with `<app-root>`

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | `MainGameComponent` | Primary game screen |
| `/settings` | `SettingsComponent` | App settings (dark mode, generation, etc.) |
| `/credits` | `CreditsComponent` | Credits page |
| `/coffee` | `CoffeeComponent` | Donation / buy-me-a-coffee page |
| `**` | `NotFoundComponent` | 404 fallback |

## Layers / Modules

### Shell Layer
- **Purpose:** Application bootstrap, routing, global providers, i18n initialization
- **Key files:** `src/app/app.component.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`

### Page Components (Route-Level)
- **Purpose:** Top-level routed views; each corresponds to one route
- **Key files:**
  - `src/app/main-game/main-game.component.ts` — Main game orchestrator
  - `src/app/settings/settings.component.ts` — Game settings
  - `src/app/credits/credits.component.ts`
  - `src/app/coffee/coffee.component.ts`
  - `src/app/not-found/not-found.component.ts`

### Game Orchestration Layer
- **Purpose:** Coordinates the active game state, mediates between roulette outcomes and service calls, handles modal flow
- **Key files:**
  - `src/app/main-game/roulette-container/roulette-container.component.ts` — Central dispatcher: listens to current `GameState`, renders the correct roulette sub-component, handles all roulette output events, advances state
  - `src/app/main-game/main-game.component.ts` — Layout host; delegates game logic to `RouletteContainerComponent`

### Roulette Sub-Components (Game Screens)
- **Purpose:** Each roulette represents one game event/decision point. Renders a `WheelComponent`, defines available actions as `WheelItem[]`, emits typed `@Output()` events on spin result
- **Location:** `src/app/main-game/roulette-container/roulettes/`
- **28 roulettes including:**
  - `generation-roulette/` — Selects Pokemon generation
  - `starter-roulette/` — Picks starter Pokemon
  - `main-adventure-roulette/` — Hub: catch, battle, explore, etc.
  - `gym-battle-roulette/`, `elite-four-battle-roulette/`, `champion-battle-roulette/`
  - `pokemon-from-generation-roulette/`, `pokemon-from-aux-list-roulette/`
  - `check-evolution-roulette/`, `shiny-roulette/`, `select-form-roulette/`
  - `find-item-roulette/`, `explore-cave-roulette/`, `fishing-roulette/`, `fossil-roulette/`
  - `team-rocket-roulette/`, `legendary-roulette/`, `snorlax-roulette/`, `area-zero-roulette/`
  - `trade-pokemon-roulette/`, `mysterious-egg-roulette/`, `rival-battle-roulette/`
  - `character-select/` — Trainer character selection screen
  - `start-adventure-roulette/`

### Shared UI Components
- **Purpose:** Reusable UI elements used across page components
- **Key files:**
  - `src/app/wheel/wheel.component.ts` — Canvas-based spinning wheel (weighted segments, eased animation, sound FX)
  - `src/app/trainer-team/trainer-team.component.ts` — Displays trainer sprite, team, badges
  - `src/app/trainer-team/badges/` — Badge display sub-component
  - `src/app/trainer-team/storage-pc/` — PC storage box
  - `src/app/trainer-team/pokedex/` — Trainer-side Pokédex view
  - `src/app/items/items.component.ts` — Item inventory display
  - `src/app/pokedex/` — Full Pokédex browser (by generation)
  - `src/app/settings/dark-mode-toggle/` — Dark mode toggle widget
  - `src/app/main-game/end-game/` — End game screen
  - `src/app/main-game/game-over/` — Game over screen
  - `src/app/main-game/generation-map/` — Pokemon generation map
  - `src/app/main-game/language-selector/` — Language switcher
  - `src/app/main-game/roulette-container/roulette-container.component.ts` action buttons: `coffee-button/`, `credits-button/`
  - `src/app/main-game-button/` — Main game nav button
  - `src/app/restart-game-buttom/` — Restart game button
  - `src/app/settings-button/` — Settings nav button

### Services Layer
- **Purpose:** Injectable singleton services providing state, data access, and business logic
- **Location:** `src/app/services/`
- **Key services:**
  - `game-state-service/game-state.service.ts` — Game state machine (stack-based, BehaviorSubject)
  - `trainer-service/trainer.service.ts` — Trainer sprite, team, items, badges management
  - `pokemon-service/pokemon.service.ts` — National dex data + PokeAPI sprite fetching
  - `evolution-service/evolution.service.ts` — Evolution chain lookups
  - `generation-service/generation.service.ts` — Selected Pokemon generation state
  - `settings-service/settings.service.ts` — App settings persistence
  - `dark-mode-service/dark-mode.service.ts` — Dark mode state
  - `items-service/items.service.ts` — Item definitions
  - `badges-service/badges.service.ts` — Badge definitions and state
  - `pokedex-service/pokedex.service.ts` — Pokedex state management
  - `modal-queue-service/modal-queue.service.ts` — Queued modal presentation
  - `rare-candy-service/rare-candy.service.ts` — Rare candy evolution triggers
  - `sound-fx-service/sound-fx.service.ts` — Sound effect playback
  - `analytics-service/analytics.service.ts` — Google Analytics event tracking
  - `pokemon-forms-service/pokemon-forms.service.ts` — Alternate form variants
  - `item-sprite-service/item-sprite.service.ts` — Item sprite URL resolution
  - `type-matchup-service/type-matchup.service.ts` — Pokemon type effectiveness

### Data / Interfaces Layer
- **Purpose:** TypeScript interfaces and static data
- **Key files:**
  - `src/app/interfaces/pokemon-item.ts` — `PokemonItem` extends `WheelItem`
  - `src/app/interfaces/wheel-item.ts` — `WheelItem` base: `{ text, fillStyle, weight }`
  - `src/app/interfaces/item-item.ts` — In-game item
  - `src/app/interfaces/badge.ts` — Gym badge
  - `src/app/interfaces/generation-item.ts` — Pokemon generation descriptor
  - `src/app/interfaces/gym-leader.ts` — Gym leader data
  - `src/app/interfaces/pokemon-form.ts` — Alternate form
  - `src/app/interfaces/pokemon-type.ts` — Type enum/literal
  - `src/app/interfaces/type-matchup.ts` — Type effectiveness table
  - `src/app/interfaces/wheel-item.ts` — Wheel segment definition
  - `src/app/interfaces/language.ts` — Supported language
  - `src/app/services/pokemon-service/national-dex-pokemon.ts` — Full static National Pokédex array (~1000 entries)
  - `src/app/services/game-state-service/game-state.ts` — `GameState` union type (30+ states)
  - `src/app/main-game/EventSource.ts` — `EventSource` union type for battle context

### Utils
- **Purpose:** Pure utility functions
- **Key files:** `src/app/utils/odd-utils.ts` — Probability/odds helpers

## Data Flow

### Game State Progression

1. `GameStateService` initializes a pre-ordered stack of `GameState` values (character-select → starter → gyms × 8 → elite four × 4 → champion → finish)
2. `RouletteContainerComponent` subscribes to `currentState` observable
3. Template `@if` blocks conditionally render the appropriate roulette sub-component for the current state
4. User clicks **Spin** → `WheelComponent.spinWheel()` runs canvas animation → emits `selectedItemEvent` with winning index
5. Roulette component receives index → maps to action via `switch` → emits typed `@Output()` event
6. `RouletteContainerComponent` handles the output event → calls services (TrainerService, EvolutionService, etc.) → calls `gameStateService.finishCurrentState()` to pop next state
7. Certain outcomes push additional states onto the stack (e.g., catching a Pokémon pushes `check-shininess`, then `check-evolution`)

### Pokemon Data Flow

1. Static data: `nationalDexPokemon` array (bundled in `national-dex-pokemon.ts`) provides base Pokémon info
2. Dynamic sprites: `PokemonService.getPokemonSprites(id)` calls PokeAPI `https://pokeapi.co/api/v2/pokemon/{id}`, extracts official-artwork sprites, retries 3×
3. Sprites stored on `PokemonItem.sprite` and rendered in `TrainerTeamComponent`

### State Observable Pattern

All mutable state is wrapped in `BehaviorSubject` → exposed as `.asObservable()` → components subscribe via `takeUntilDestroyed(destroyRef)` or manual `Subscription` with `ngOnDestroy` cleanup.

## Key Abstractions

- `GameState` (union type) in `src/app/services/game-state-service/game-state.ts` — 30+ string literals representing every possible game moment
- `WheelItem` interface in `src/app/interfaces/wheel-item.ts` — Base segment: `{ text: string, fillStyle: string, weight: number }`
- `PokemonItem` interface in `src/app/interfaces/pokemon-item.ts` — Extends `WheelItem`, adds `pokemonId`, types, sprite URLs, `shiny`, `power`
- `EventSource` type in `src/app/main-game/EventSource.ts` — Context tag for battle events (e.g., `'gym-battle'`, `'rare-candy'`)
- `GameStateService` in `src/app/services/game-state-service/game-state.service.ts` — Stack-based state machine with BehaviorSubject observables
- `WheelComponent` in `src/app/wheel/wheel.component.ts` — Reusable canvas wheel; takes `WheelItem[]` input, emits `selectedItemEvent: number`

## Component Hierarchy

```
AppComponent (RouterOutlet)
├── MainGameComponent                          [route: /]
│   ├── RouletteContainerComponent             [game orchestrator]
│   │   ├── WheelComponent                     [shared canvas wheel - used inside each roulette]
│   │   ├── GenerationRouletteComponent
│   │   ├── CharacterSelectComponent
│   │   ├── StarterRouletteComponent
│   │   ├── StartAdventureRouletteComponent
│   │   ├── MainAdventureRouletteComponent     [central hub roulette]
│   │   ├── GymBattleRouletteComponent
│   │   ├── EliteFourPrepRouletteComponent
│   │   ├── EliteFourBattleRouletteComponent
│   │   ├── ChampionBattleRouletteComponent
│   │   ├── PokemonFromGenerationRouletteComponent
│   │   ├── PokemonFromAuxListRouletteComponent
│   │   ├── CheckEvolutionRouletteComponent
│   │   ├── ShinyRouletteComponent
│   │   ├── SelectFormRouletteComponent
│   │   ├── TeamRocketRouletteComponent
│   │   ├── MysteriousEggRouletteComponent
│   │   ├── LegendaryRouletteComponent
│   │   ├── CatchLegendaryRouletteComponent
│   │   ├── CatchParadoxRouletteComponent
│   │   ├── AreaZeroRoulette
│   │   ├── TradePokemonRouletteComponent
│   │   ├── FindItemRouletteComponent
│   │   ├── ExploreCaveRouletteComponent
│   │   ├── CavePokemonRouletteComponent
│   │   ├── FossilRouletteComponent
│   │   ├── SnorlaxRouletteComponent
│   │   ├── FishingRouletteComponent
│   │   ├── RivalBattleRouletteComponent
│   │   ├── EndGameComponent
│   │   └── GameOverComponent
│   ├── TrainerTeamComponent
│   │   ├── BadgesComponent
│   │   ├── StoragePcComponent
│   │   └── PokedexComponent
│   ├── ItemsComponent
│   ├── RestartGameButtonComponent
│   ├── SettingsButtonComponent
│   ├── CoffeeButtonComponent
│   └── LanguageSelectorComponent
├── SettingsComponent                          [route: /settings]
│   └── DarkModeToggleComponent
├── CreditsComponent                           [route: /credits]
├── CoffeeComponent                            [route: /coffee]
└── NotFoundComponent                          [route: **]
```

## Error Handling

**Strategy:** Observable-level `catchError` on HTTP calls with `retry(3, 1000ms)` in `PokemonService`. Console error logging as fallback. No global error boundary.

**Patterns:**
- `PokemonService.getPokemonSprites()` — `retry({ count: 3, delay: 1000 })` then `catchError` → `throwError`
- Placeholder sprite `'place-holder-pixel.png'` used when sprite is null/unavailable
- `bootstrapApplication(...).catch(err => console.error(err))` in `main.ts`

## Cross-Cutting Concerns

**Internationalization:** ngx-translate with JSON files in `src/assets/i18n/` (en, es, fr, de, it, pt). Language persisted to `localStorage`. All display strings use translation keys.

**Dark Mode:** `DarkModeService` with `darkMode$: Observable<boolean>` — components subscribe and apply CSS class conditionally.

**Analytics:** `AnalyticsService` wraps Google Analytics gtag — loaded dynamically in `AppComponent` only in production. Components call `analyticsService.trackEvent(...)`.

**Sound FX:** `SoundFxService` provides `createClickSoundFx()` and `playSoundFx()` — used by `WheelComponent` for tick sounds during spin.

---

*Architecture analysis: 2025-01-31*
