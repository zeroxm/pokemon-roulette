# Project Structure

**Analysis Date:** 2025-01-31

## Directory Layout

```
pokemon-roulette/
├── src/
│   ├── main.ts                        # Application bootstrap
│   ├── index.html                     # HTML shell
│   ├── styles.css                     # Global styles
│   ├── environments/
│   │   ├── environment.ts             # Dev environment config
│   │   └── environment.prod.ts        # Prod environment config (file-replaced at build)
│   ├── assets/
│   │   └── i18n/                      # Translation JSON files (en, es, fr, de, it, pt)
│   └── app/
│       ├── app.component.ts           # Root component (RouterOutlet + i18n init)
│       ├── app.config.ts              # ApplicationConfig (providers)
│       ├── app.routes.ts              # Route definitions
│       ├── interfaces/                # TypeScript interfaces (shared data shapes)
│       │   ├── pokemon-item.ts
│       │   ├── wheel-item.ts
│       │   ├── item-item.ts
│       │   ├── badge.ts
│       │   ├── generation-item.ts
│       │   ├── gym-leader.ts
│       │   ├── pokemon-form.ts
│       │   ├── pokemon-type.ts
│       │   ├── type-matchup.ts
│       │   └── language.ts
│       ├── services/                  # Injectable singleton services
│       │   ├── analytics-service/
│       │   ├── badges-service/
│       │   ├── dark-mode-service/
│       │   ├── evolution-service/
│       │   ├── game-state-service/    # Core state machine
│       │   ├── generation-service/
│       │   ├── item-sprite-service/
│       │   ├── items-service/
│       │   ├── modal-queue-service/
│       │   ├── pokedex-service/
│       │   ├── pokemon-forms-service/
│       │   ├── pokemon-service/       # PokeAPI + national dex data
│       │   ├── rare-candy-service/
│       │   ├── settings-service/
│       │   ├── sound-fx-service/
│       │   ├── trainer-service/       # Team, items, badges state
│       │   └── type-matchup-service/
│       ├── wheel/                     # Reusable canvas wheel component
│       ├── utils/                     # Pure utility functions
│       ├── main-game/                 # Primary game route
│       │   ├── main-game.component.ts
│       │   ├── EventSource.ts         # EventSource union type
│       │   ├── coffee-button/
│       │   ├── credits-button/
│       │   ├── end-game/
│       │   ├── game-over/
│       │   ├── generation-map/
│       │   ├── language-selector/
│       │   └── roulette-container/    # Game state dispatcher
│       │       ├── roulette-container.component.ts
│       │       └── roulettes/         # 28 roulette sub-components
│       │           ├── area-zero-roulette/
│       │           ├── catch-legendary-roulette/
│       │           ├── catch-paradox-roulette/
│       │           ├── cave-pokemon-roulette/
│       │           ├── champion-battle-roulette/
│       │           ├── character-select/
│       │           ├── check-evolution-roulette/
│       │           ├── elite-four-battle-roulette/
│       │           ├── elite-four-prep-roulette/
│       │           ├── explore-cave-roulette/
│       │           ├── find-item-roulette/
│       │           ├── fishing-roulette/
│       │           ├── fossil-roulette/
│       │           ├── generation-roulette/
│       │           ├── gym-battle-roulette/
│       │           ├── legendary-roulette/
│       │           ├── main-adventure-roulette/
│       │           ├── mysterious-egg-roulette/
│       │           ├── pokemon-from-aux-list-roulette/
│       │           ├── pokemon-from-generation-roulette/
│       │           ├── rival-battle-roulette/
│       │           ├── select-form-roulette/
│       │           ├── shiny-roulette/
│       │           ├── snorlax-roulette/
│       │           ├── start-adventure-roulette/
│       │           ├── starter-roulette/
│       │           ├── team-rocket-roulette/
│       │           └── trade-pokemon-roulette/
│       ├── trainer-team/              # Trainer panel
│       │   ├── trainer-team.component.ts
│       │   ├── badges/
│       │   ├── storage-pc/
│       │   └── pokedex/
│       ├── items/                     # Item inventory component
│       ├── pokedex/                   # Full Pokédex browser
│       │   ├── pokedex-by-generation.ts
│       │   ├── pokedex-detail-modal/
│       │   └── pokedex-entry/
│       ├── settings/                  # Settings route
│       │   └── dark-mode-toggle/
│       ├── settings-button/           # Settings nav button
│       ├── main-game-button/          # Main game nav button
│       ├── restart-game-buttom/       # Restart button (note: typo in directory name)
│       ├── credits/                   # Credits route
│       ├── coffee/                    # Donation route
│       └── not-found/                 # 404 route
├── public/                            # Static assets served at root
├── types/
│   └── dom-to-image-more.d.ts         # Type declaration for dom-to-image-more
├── angular.json                       # Angular CLI workspace config
├── package.json                       # Dependencies (Angular 21, Bootstrap 5, ngx-translate)
├── tsconfig.json                      # Base TypeScript config
├── tsconfig.app.json                  # App-specific TS config
└── tsconfig.spec.json                 # Test TS config
```

## Key Locations

- `src/main.ts` — Application entry point
- `src/app/app.config.ts` — All global providers (router, HTTP, i18n, icons)
- `src/app/app.routes.ts` — All route definitions
- `src/app/interfaces/` — All shared TypeScript interfaces
- `src/app/services/` — All injectable services (state, data, utilities)
- `src/app/wheel/wheel.component.ts` — Reusable canvas spinning wheel
- `src/app/main-game/roulette-container/roulette-container.component.ts` — Game state dispatcher (largest file, ~700+ lines)
- `src/app/main-game/roulette-container/roulettes/` — All 28 individual game event roulettes
- `src/app/services/game-state-service/game-state.service.ts` — Core game state machine
- `src/app/services/game-state-service/game-state.ts` — `GameState` union type
- `src/app/services/trainer-service/trainer.service.ts` — Team/items/badges state
- `src/app/services/pokemon-service/national-dex-pokemon.ts` — Full national Pokédex static data
- `src/assets/i18n/` — Translation files (en.json, es.json, fr.json, de.json, it.json, pt.json)
- `src/environments/` — Environment configs (dev/prod)

## Naming Conventions

**Components:**
- Class: `PascalCase` + `Component` suffix — e.g., `MainGameComponent`, `WheelComponent`
- Selector: `app-kebab-case` — e.g., `app-wheel`, `app-main-game`, `app-roulette-container`
- File: `kebab-case.component.ts` / `.html` / `.css` / `.spec.ts`

**Services:**
- Class: `PascalCase` + `Service` suffix — e.g., `GameStateService`, `TrainerService`
- File: `kebab-case.service.ts` / `.spec.ts`
- Directory: `kebab-case-service/` — e.g., `game-state-service/`

**Interfaces:**
- Class: `PascalCase` — e.g., `PokemonItem`, `WheelItem`, `Badge`
- File: `kebab-case.ts` — e.g., `pokemon-item.ts`, `wheel-item.ts`

**Types:**
- Union types: `PascalCase` — e.g., `GameState`, `EventSource`
- File: matches primary export name — `game-state.ts`, `EventSource.ts`

**Roulette sub-components:**
- Directory: `kebab-case-roulette/` — e.g., `gym-battle-roulette/`
- Class: `PascalCase` + `RouletteComponent` — e.g., `GymBattleRouletteComponent`

**Static data files:**
- Named descriptively alongside their service: `national-dex-pokemon.ts`, `trainer-sprite-data.ts`

**Note:** One known typo: `restart-game-buttom/` (should be `restart-game-button/`)

## Module Organization

The project uses **Angular Standalone Components** exclusively (no `NgModule`). Code is organized by feature:

**Feature grouping principle:** Each feature owns its directory containing `.component.ts`, `.component.html`, `.component.css`, and `.component.spec.ts`. Child components live in subdirectories of their parent feature.

**Service grouping:** Each service gets its own directory (e.g., `services/game-state-service/`) containing the service file, spec file, and any supporting types/data the service owns exclusively.

**Shared interfaces:** Placed flat in `src/app/interfaces/` — no feature sub-directories. Interfaces are not feature-scoped.

**Roulettes pattern:** Each roulette screen is a standalone component in `src/app/main-game/roulette-container/roulettes/{name}-roulette/`. It composes `WheelComponent`, defines `WheelItem[]` actions, and emits `@Output()` events. The parent `RouletteContainerComponent` handles all outputs.

## Where to Add New Code

**New roulette screen:**
- Create directory: `src/app/main-game/roulette-container/roulettes/{name}-roulette/`
- Add 4 files: `.component.ts`, `.component.html`, `.component.css`, `.spec.ts`
- Import and render in `src/app/main-game/roulette-container/roulette-container.component.ts`
- Add new `GameState` value to `src/app/services/game-state-service/game-state.ts`

**New service:**
- Create directory: `src/app/services/{name}-service/`
- Add `{name}.service.ts` with `@Injectable({ providedIn: 'root' })`
- Add `{name}.service.spec.ts`

**New interface:**
- Add `{name}.ts` to `src/app/interfaces/`

**New page route:**
- Create component directory at `src/app/{name}/`
- Register in `src/app/app.routes.ts`

**New translation key:**
- Add to all files in `src/assets/i18n/` (en.json, es.json, fr.json, de.json, it.json, pt.json)

**New utility function:**
- Add to `src/app/utils/odd-utils.ts` or create `src/app/utils/{name}-utils.ts`

---

*Structure analysis: 2025-01-31*
