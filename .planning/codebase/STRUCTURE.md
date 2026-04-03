# Codebase Structure

**Analysis Date:** 2024-01-15

## Directory Layout

```
pokemon-roulette/
├── src/                           # Source code
│   ├── app/                       # Angular application
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── services/              # Business logic services
│   │   ├── main-game/             # Core game component
│   │   │   └── roulette-container/    # Roulette routing
│   │   │       └── roulettes/         # 25+ roulette components
│   │   ├── wheel/                 # Reusable wheel component
│   │   ├── trainer-team/          # Pokemon team display
│   │   ├── items/                 # Items display
│   │   ├── settings/              # Settings page
│   │   ├── credits/               # Credits page
│   │   ├── coffee/                # Coffee/donation page
│   │   ├── not-found/             # 404 page
│   │   ├── utils/                 # Utility functions
│   │   ├── app.component.ts       # Root component
│   │   ├── app.config.ts          # App configuration
│   │   └── app.routes.ts          # Route definitions
│   ├── assets/                    # Static assets
│   │   └── i18n/                  # Translation files (JSON)
│   ├── index.html                 # HTML entry point
│   ├── main.ts                    # Bootstrap entry point
│   └── styles.css                 # Global styles
├── public/                        # Public assets (copied to dist)
├── dist/                          # Build output
├── angular.json                   # Angular CLI configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App TypeScript config
├── tsconfig.spec.json             # Test TypeScript config
├── package.json                   # Dependencies and scripts
├── README.md                      # Project readme
└── spec.md                        # Technical specification
```

## Directory Purposes

**`src/app/`:**
- Purpose: Root of Angular application code
- Contains: Components, services, interfaces, utilities
- Key files: `app.component.ts`, `app.routes.ts`, `app.config.ts`

**`src/app/interfaces/`:**
- Purpose: TypeScript interface definitions for all data models
- Contains: Game entity types (Pokemon, items, badges, etc.)
- Key files:
  - `wheel-item.ts` - Base interface for all roulette items
  - `pokemon-item.ts` - Pokemon data structure
  - `item-item.ts` - In-game item structure
  - `gym-leader.ts` - Gym leader battle data
  - `badge.ts` - Badge collection data
  - `generation-item.ts` - Pokemon generation definition
  - `pokemon-form.ts` - Pokémon form variant

**`src/app/services/`:**
- Purpose: Business logic, data management, cross-cutting concerns
- Contains: 15+ domain-specific service folders
- Naming: `{domain}-service/` (e.g., `pokemon-service/`, `game-state-service/`)
- Key services:
  - `game-state-service/` - State machine controller
  - `pokemon-service/` - Pokemon data (PokeAPI integration)
  - `trainer-service/` - Team management and battle tracking
  - `items-service/` - In-game items management
  - `evolution-service/` - Evolution mechanics
  - `dark-mode-service/` - Theme switching
  - `generation-service/` - Pokemon generation selection
  - `badges-service/` - Gym badge collection
  - `settings-service/` - Game configuration
  - `analytics-service/` - Event tracking
  - `sound-fx-service/` - Audio playback
  - `modal-queue-service/` - Modal dialog management
  - `pokemon-forms-service/` - Form variant handling
  - `item-sprite-service/` - Item sprite URL generation
  - `rare-candy-service/` - Special item effects

**`src/app/main-game/`:**
- Purpose: Core game component and layout
- Contains: Main game controller, roulette container, supporting components
- Key files:
  - `main-game.component.ts` - Central game component
  - `roulette-container/` - Roulette routing and outcome handling
  - `language-selector/` - Language selection UI
  - `generation-map/` - Visual map of game progress
  - `coffee-button/`, `credits-button/` - Navigation buttons
  - `end-game/`, `game-over/` - End screen components

**`src/app/main-game/roulette-container/`:**
- Purpose: Router for 25+ roulette components
- Contains: Main roulette component and roulette subdirectory
- Key file: `roulette-container.component.ts` (350+ lines, handles all game logic)

**`src/app/main-game/roulette-container/roulettes/`:**
- Purpose: 25+ specialized roulette component folders
- Naming pattern: `{scenario}-roulette/` (e.g., `starter-roulette/`, `gym-battle-roulette/`)
- Each roulette contains:
  - Component file (`.component.ts`)
  - Test file (`.component.spec.ts`)
  - Template file (`.component.html`) - usually minimal
  - Stylesheet (`.component.css`) - usually empty
  - Data file (e.g., `starter-by-generation.ts`) - lookup tables
- List of roulettes:
  - `starter-roulette/` - Choose starter Pokemon
  - `character-select/` - Choose trainer sprite
  - `gym-battle-roulette/` - Gym leader battles
  - `elite-four-battle-roulette/` - Elite Four battles
  - `champion-battle-roulette/` - Champion battle
  - `legendary-roulette/` - Legendary Pokemon encounters
  - `catch-legendary-roulette/` - Catch legendary Pokemon
  - `pokemon-from-generation-roulette/` - Catch regular Pokemon
  - `cave-pokemon-roulette/` - Cave-only Pokemon
  - `fossil-roulette/` - Fossil Pokemon
  - `fishing-roulette/` - Fishing Pokemon
  - `area-zero-roulette/` - Paradox Pokemon
  - `catch-paradox-roulette/` - Catch paradox Pokemon
  - `find-item-roulette/` - Find items
  - `mysterious-egg-roulette/` - Mysterious egg hatch
  - `trade-pokemon-roulette/` - Trade Pokemon
  - `check-evolution-roulette/` - Evolution check
  - `select-form-roulette/` - Form variant selection
  - `start-adventure-roulette/` - Adventure start flavor
  - `main-adventure-roulette/` - Main adventure encounters
  - `team-rocket-roulette/` - Team Rocket battle
  - `rival-battle-roulette/` - Rival battles
  - `elite-four-prep-roulette/` - Elite Four prep
  - `snorlax-roulette/` - Snorlax encounter
  - `generation-roulette/` - Generation selection
  - `pokemon-from-aux-list-roulette/` - Auxiliary Pokemon list
  - `shiny-roulette/` - Shiny Pokemon check

**`src/app/wheel/`:**
- Purpose: Reusable spinning wheel component with canvas rendering
- Contains: Single component with HTML5 2D canvas integration
- Key file: `wheel.component.ts` (350+ lines)
- Features: Weighted probability, i18n support, dark mode, responsive sizing

**`src/app/trainer-team/`:**
- Purpose: Display player's Pokemon team and badges
- Contains: Team display and storage PC components
- Key files:
  - `trainer-team.component.ts` - Main team display
  - `badges/` - Gym badge display
  - `storage-pc/` - Caught Pokemon storage

**`src/app/items/`:**
- Purpose: Display collected items
- Contains: Item list component
- Key file: `items.component.ts`

**`src/app/settings/`:**
- Purpose: Settings page for game configuration
- Contains: Settings form and dark mode toggle
- Key files:
  - `settings.component.ts` - Main settings
  - `dark-mode-toggle/` - Dark mode switch

**`src/app/utils/`:**
- Purpose: Reusable utility functions
- Contains: Helper functions for calculations and common operations
- Key file: `odd-utils.ts` - Probability and random selection utilities

**`src/assets/`:**
- Purpose: Static assets embedded in the app
- Contains: Images, icons, and i18n JSON files
- Subdirectories:
  - `i18n/` - Translation files (en.json, es.json, fr.json, de.json, it.json, pt.json)

**`public/`:**
- Purpose: Static files copied to dist root (GitHub Pages deployment)
- Contains: Images, favicons, and other public assets

## Key File Locations

**Entry Points:**
- `src/main.ts` - Bootstrap the app, calls `bootstrapApplication(AppComponent)`
- `src/index.html` - HTML entry point with `<app-root>` selector
- `src/app/app.component.ts` - Root component (i18n initialization)
- `src/app/app.routes.ts` - Route definitions (4 main routes + 404)

**Configuration:**
- `angular.json` - Angular CLI configuration (build, serve, test settings)
- `tsconfig.json` - TypeScript compiler options
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.spec.json` - Test-specific TypeScript config
- `app.config.ts` - Angular application configuration (providers, icons, i18n)

**Core Logic:**
- `src/app/main-game/roulette-container/roulette-container.component.ts` - Main game logic (state routing, outcome handling)
- `src/app/services/game-state-service/game-state.service.ts` - State machine
- `src/app/services/trainer-service/trainer.service.ts` - Team management
- `src/app/services/pokemon-service/pokemon.service.ts` - Pokemon data and PokeAPI

**Wheel Component:**
- `src/app/wheel/wheel.component.ts` - Canvas-based wheel renderer
- `src/app/wheel/wheel.component.html` - Wheel template (canvas elements)
- `src/app/wheel/wheel.component.css` - Wheel styling

**Testing:**
- Test files co-located with sources (`.spec.ts` suffix)
- Karma configuration: `karma.conf.js` (auto-generated)

## Naming Conventions

**Files:**
- TypeScript components: `{component-name}.component.ts`
- Component tests: `{component-name}.component.spec.ts`
- Component templates: `{component-name}.component.html`
- Component styles: `{component-name}.component.css`
- Services: `{service-name}.service.ts` (e.g., `pokemon.service.ts`)
- Service tests: `{service-name}.service.spec.ts`
- Interfaces: `{entity-name}.ts` (e.g., `pokemon-item.ts`)
- Data files: `{entity}-by-generation.ts` or `{entity}-data.ts`
- Utilities: `{utility-name}-utils.ts`

**Directories:**
- Feature folders: `{feature-name}/` (e.g., `trainer-team/`, `items/`)
- Service folders: `{domain}-service/` (e.g., `pokemon-service/`)
- Roulette folders: `{scenario}-roulette/` (e.g., `starter-roulette/`)
- Interfaces: `interfaces/` (all interfaces in one directory)
- Services: `services/` with subfolders by domain
- Utils: `utils/`

**TypeScript Symbols:**
- Component classes: PascalCase (e.g., `StarterRouletteComponent`)
- Service classes: PascalCase (e.g., `PokemonService`)
- Interface types: PascalCase (e.g., `PokemonItem`)
- Enum types: PascalCase (e.g., `GameState`)
- Functions: camelCase (e.g., `getPokemonById()`)
- Properties: camelCase (e.g., `pokemonId`, `wheelSpinning`)
- Constants: UPPER_SNAKE_CASE (rare, mostly used for magic numbers)

**CSS Classes:**
- Component-specific: `{component-name}-{element}` (e.g., `wheel-canvas`, `team-list`)
- Bootstrap utility classes used throughout (e.g., `container`, `row`, `col`, `btn`, `btn-primary`)

## Where to Add New Code

**New Feature (e.g., New Game Mechanic):**
- Create new roulette component at: `src/app/main-game/roulette-container/roulettes/{feature}-roulette/`
- Files needed:
  - `{feature}-roulette.component.ts` - Component logic
  - `{feature}-roulette.component.html` - Template (usually just wheel)
  - `{feature}-roulette.component.css` - Styling (often empty)
  - `{feature}-roulette.component.spec.ts` - Unit tests
  - Optional: `{feature}-data.ts` - Data lookup tables
- Add game state to: `src/app/services/game-state-service/game-state.ts`
- Add import and route to: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Add state handling in: `roulette-container.component.ts` ngSwitch and outcome methods

**New Service:**
- Create folder: `src/app/services/{domain}-service/`
- Files needed:
  - `{domain}.service.ts` - Service implementation
  - `{domain}.service.spec.ts` - Unit tests
- Export with: `providedIn: 'root'` decorator
- Example structure:
  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class NewService {
    constructor(/* dependencies */) { }
  }
  ```

**New Component (non-roulette):**
- Create folder: `src/app/{feature}/`
- Files needed:
  - `{feature}.component.ts` - Component
  - `{feature}.component.html` - Template
  - `{feature}.component.css` - Styles
  - `{feature}.component.spec.ts` - Tests
- If modal/dialog, add to: `roulette-container.component.ts` template
- If page-level, add route to: `src/app/app.routes.ts`

**New Interface:**
- Add to existing file in: `src/app/interfaces/{entity-name}.ts`
- Or create new file if new entity type
- Use naming: Export single interface per concept
- Example: `interface NewEntity extends WheelItem { ... }`

**Utility Functions:**
- Add to: `src/app/utils/{utility-name}-utils.ts`
- Or add to existing: `src/app/utils/odd-utils.ts`
- Export as named functions, not default

**Tests:**
- Co-locate with source: `{file-name}.spec.ts`
- Use Jasmine + Karma
- See `src/app/services/pokemon-service/pokemon.service.spec.ts` for patterns

**Translations:**
- Add to: `src/assets/i18n/{language-code}.json`
- Use namespaced keys: `"pokemon.name"`, `"items.potion"`, `"game.states.gym-battle"`
- Update all 6 files: en.json, es.json, fr.json, de.json, it.json, pt.json

## Special Directories

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes (by `npm install`)
- Committed: No (ignored by .gitignore)

**`dist/`:**
- Purpose: Build output (compiled Angular app)
- Generated: Yes (by `ng build`)
- Committed: No (ignored by .gitignore)
- Deployment: Push `dist/pokemon-roulette/` to GitHub Pages

**`.angular/`:**
- Purpose: Angular CLI cache
- Generated: Yes (by Angular CLI)
- Committed: No (ignored by .gitignore)

**`types/`:**
- Purpose: Custom type definitions (if any)
- Generated: No
- Committed: Yes (if used)

**`.planning/`:**
- Purpose: GSD planning documents (this directory)
- Generated: Yes (by GSD tools)
- Committed: Yes

## Import Path Aliases

**TypeScript Paths (tsconfig.json):**
- Not configured by default; Angular CLI allows direct paths
- All imports use relative paths or absolute from `src/` based on module resolution
- Pattern: Import from feature folders directly
  ```typescript
  import { PokemonService } from '../../services/pokemon-service/pokemon.service';
  import { PokemonItem } from '../../interfaces/pokemon-item';
  ```

## Asset Management

**Images/Icons:**
- Pokemon sprites: Loaded from PokeAPI at runtime (not stored locally)
- Item sprites: Hardcoded URLs in `items-service` data files
- UI icons: ng-icons/bootstrap-icons (SVG)
- Public assets: Copied from `public/` to `dist/` root

**Localization Files:**
- Path: `src/assets/i18n/`
- Format: JSON (key-value pairs)
- Languages: en, es, fr, de, it, pt
- Pattern: Nested objects for organization
  ```json
  {
    "pokemon": { "name": "Pokémon" },
    "items": { "potion": { "name": "Potion" } }
  }
  ```

---

*Structure analysis: 2024-01-15*
