<!-- GSD:project-start source:PROJECT.md -->
## Project

**Pokémon Roulette — Pokédex Feature**

Pokémon Roulette is a browser-based randomizer game where players spin a roulette wheel to assemble a Pokémon team and battle through a generation's gym leaders, Elite Four, and Champion. The current milestone adds a persistent Pokédex — a global tracker that records every Pokémon assigned to the player's team across all runs, with a special distinction for Pokémon that were on the team when the Champion was defeated.

**Core Value:** Players can see which Pokémon they've encountered and won with over time, giving the game lasting replayability beyond individual runs.

### Constraints

- **Tech stack**: Angular 21 + Bootstrap 5 + ng-bootstrap — no new UI frameworks
- **Data**: Pokédex data must survive game resets (only `TrainerService.resetTeam()` should clear the in-run team, not the Pokédex)
- **Compatibility**: Must work on GitHub Pages (static deployment, no server-side logic)
- **Performance**: Pokédex grid can have 1,025 entries — sprites must be loaded lazily on demand, not all at once
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - Application code, services, components
- HTML 5 - Templates and UI structure
- CSS 3 - Styling and responsive design
- JavaScript (ES2022) - Runtime execution
## Runtime
- Node.js (LTS recommended - specified via Angular CLI requirements)
- npm (version specified via package-lock.json)
- Lockfile: `package-lock.json` present
## Frameworks
- Angular 21.2.7 - Modern single-page application framework (`package.json`, `src/app/app.config.ts`)
- Angular CLI 21.2.6 - Build and development tooling (`angular.json`)
- Bootstrap 5.3.8 - CSS framework and grid system (`angular.json`, lines 31-33)
- ng-bootstrap 20.0.0 - Angular-native Bootstrap components (`package.json`)
- Angular Component Development Kit (CDK) 21.2.5 - Advanced component patterns (`package.json`)
- @ngx-translate/core 17.0.0 - Multi-language support (`package.json`, `src/app/app.config.ts`)
- @ngx-translate/http-loader 17.0.0 - Loads translations from JSON files (`src/app/app.config.ts`, lines 18, 40-45)
- Translation files: `src/assets/i18n/` (en.json, es.json, fr.json, pt.json, de.json, it.json)
- @ng-icons/core 33.2.0 - Icon system (`package.json`, `src/app/app.config.ts`)
- @ng-icons/bootstrap-icons 33.2.0 - Bootstrap icon set (`package.json`, `src/app/app.config.ts`, lines 26-36)
- rxjs 7.8.2 - Reactive programming library for observables and streams (`package.json`)
- zone.js 0.16.1 - Angular zone management (`package.json`)
- tslib 2.8.1 - TypeScript runtime helpers (`package.json`)
- @popperjs/core 2.11.8 - Tooltip/dropdown positioning library (`package.json`)
- fireworks-js 2.10.8 - Celebration fireworks animations (`package.json`)
- dom-to-image-more 3.7.2 - Image export utility for game screenshots (`package.json`)
## Testing
- Karma 6.4.4 - Test runner (`package.json`, `angular.json` lines 76-96)
- Jasmine 6.1.0 - Testing framework and assertions (`package.json`)
- karma-jasmine 5.1.0 - Karma adapter for Jasmine (`package.json`)
- karma-chrome-launcher 3.2.0 - Chrome browser launcher for tests (`package.json`)
- karma-jasmine-html-reporter 2.2.0 - HTML test report generation (`package.json`)
- karma-coverage 2.2.1 - Code coverage reporting (`package.json`)
- @types/jasmine 6.0.0 - TypeScript type definitions for Jasmine (`package.json`)
## Build & Development
- @angular-devkit/build-angular 21.2.6 - Angular build system (`package.json`)
- @angular/compiler-cli 21.2.7 - AOT compilation for Angular templates (`package.json`)
- angular-cli-ghpages 3.0.2 - GitHub Pages deployment integration (`package.json`, `angular.json` lines 97-99)
- Configured for deployment at `/pokemon-roulette/` base href
## Key Dependencies
- Angular platform modules - Core framework components
- @angular/common/http - HttpClient for API calls (`src/app/app.config.ts` line 38)
## Configuration Files
- `tsconfig.json` - Base TypeScript configuration
- `angular.json` - Angular CLI configuration
- `src/app/app.config.ts` - Application providers
## Environment & Build Execution
- Command: `npm start` or `ng serve --host 0.0.0.0 --port 4200`
- Runs on http://localhost:4200
- Hot reload on file changes
- Command: `npm run build` or `ng build`
- Output: `dist/pokemon-roulette/`
- Optimizations: tree-shaking, minification, output hashing
- Command: `npm run watch` or `ng build --watch --configuration development`
- Continuous compilation during development
- Command: `npm test` or `ng test`
- Runs tests in Chrome browser using Karma + Jasmine
- Command: `ng deploy --base-href=/pokemon-roulette/`
- Targets: GitHub Pages via angular-cli-ghpages
- Base href: `/pokemon-roulette/`
## Platform Requirements
- Node.js with npm (version matching package-lock.json)
- Modern terminal/shell
- Git for version control
- Modern web browser with:
- GitHub Pages (primary)
- Served from: https://zeroxm.github.io/pokemon-roulette/
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Components: `{feature}.component.ts`, `{feature}.component.html`, `{feature}.component.css`
- Services: `{feature}.service.ts`
- Test specs: `{feature}.spec.ts` (co-located with source)
- Type/Interface files: `{name}.ts` (exported as types/interfaces)
- Data/Config files: `{feature}-data.ts` or `{feature}-by-generation.ts`
- Utilities: `{name}-utils.ts`
- camelCase for all functions, methods, and properties
- Private methods prefixed with `private` access modifier
- Angular lifecycle methods use standard names: `ngOnInit()`, `ngOnDestroy()`, `ngOnChanges()`
- Event handlers prefixed with `on`: `onItemSelected()`, `onRouletteWheelSpun()`
- camelCase for all local and member variables
- Private fields marked with `private` or use leading underscore is NOT used
- Observable fields typically include descriptive suffix like `$` or `Observer`
- Boolean properties clearly indicate state
- PascalCase for all interfaces and types
- Interfaces define data structures; types define unions or primitives
- Type names located in `src/app/interfaces/` directory
- UPPER_SNAKE_CASE for module-level constants (rare in this codebase)
- camelCase for immutable configuration data
## Code Style
- 2 spaces for indentation (.editorconfig enforced)
- Single quotes for strings (`'string'` not `"string"`)
- Max line length: unspecified but generally kept reasonable
- Final newline required on all files (EditorConfig enforced)
- No ESLint or Prettier config found in repository
- .editorconfig enforces basic style (`charset=utf-8`, `indent_size=2`, `trim_trailing_whitespace=true`)
- TypeScript strict mode enabled in `tsconfig.json`:
- Angular strict mode in `tsconfig.json`:
## Import Organization
- No path aliases configured (`baseUrl` or `paths` in tsconfig.json)
- All imports use relative paths with `../` or `./`
## Error Handling
- Try/catch for synchronous errors (rare in this codebase)
- RxJS Observable error handling via `.catch()` or `.subscribe()` error callback
- Console error logging for unrecoverable errors
- No custom error classes or error boundary components detected
- HTTP errors not explicitly handled with custom error responses
## Logging
- Use `console.log()` for informational messages
- Use `console.error()` for errors and exceptions
- No debug logging level or conditional logging observed
- No structured logging (JSON logging) used
- Production code should avoid excessive logging; current codebase is minimal
## Comments
- Comments are minimal; code is generally self-documenting
- Complex algorithms (like `interleaveOdds()`) have detailed comments
- JSDoc/TSDoc comments used for utility functions and algorithms
- Used for complex utility functions and algorithms
- Includes `@param`, `@returns`, and descriptive text
- Example from `odd-utils.ts`:
- Rarely used for components or services (mostly self-explanatory)
- Line comments (`/** ... */`) used for marking code sections: `/** Draw the segment */`
## Function Design
- Typically small to medium (10-30 lines)
- Larger functions exist in complex components like `wheel.component.ts` (281 lines)
- No documented maximum line length for functions
- Prefer typed parameters (TypeScript strict mode enforced)
- Destructuring used occasionally for objects
- No rest parameters or function overloading observed
- Explicit return types required (TypeScript strict mode)
- Void methods when no return needed
- Observable or Promise return types for async operations
- Example: `getGeneration(): Observable<GenerationItem>`
## Module Design
- Default exports not used; named exports standard
- Services marked with `@Injectable({ providedIn: 'root' })` for singleton pattern
- Components standalone (`standalone: true`) in Angular 19
- Example from `starter-roulette.component.ts`:
- Not used; imports directly from feature modules
- Example: `import { PokemonService } from '../services/pokemon-service/pokemon.service'`
## Angular Specifics
- Constructor injection standard for services
- Private access modifier used for injected dependencies
- Example from `main-game.component.ts`:
- Standalone components (Angular 19)
- Imports declared inline in @Component decorator
- Template and style URLs use `templateUrl` and `styleUrl` (not inline)
- Example:
- `providedIn: 'root'` for singleton pattern
- Use `BehaviorSubject` for state management
- Expose as Observable with `.asObservable()`
- Example from `game-state.service.ts`:
- Subscriptions stored and unsubscribed in `ngOnDestroy()`
- Example from `starter-roulette.component.ts`:
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Linear game progression controlled by `GameStateService` state stack
- 25+ specialized roulette components for different game scenarios
- Reusable wheel component with canvas-based rendering and weighted probability system
- Reactive Observable-based state management using RxJS
- Standalone component architecture (no NgModules)
## Layers
- Purpose: Render game UI, display roulettes, and handle user interactions
- Location: `src/app/` (component tree)
- Contains: Angular components, templates, and CSS
- Depends on: Services, interfaces, shared components
- Used by: User through browser
- `AppComponent` (`src/app/app.component.ts`) - Root component managing i18n and routing
- Purpose: Manage game state, data, and cross-cutting concerns
- Location: `src/app/services/` (organized by domain)
- Contains: Services for state, Pokemon, items, training, evolution, badges
- Depends on: Interfaces, external APIs (PokeAPI), browser APIs
- Used by: Components, other services
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
- Purpose: Type definitions for game entities
- Location: `src/app/interfaces/`
- Contains: TypeScript interfaces for wheel items, Pokemon, items, badges, etc.
- `WheelItem` (`src/app/interfaces/wheel-item.ts`) - Base for all roulette items
- `PokemonItem` (`src/app/interfaces/pokemon-item.ts`) - Pokemon with sprite and power level
- `ItemItem` (`src/app/interfaces/item-item.ts`) - In-game item data
- `GenerationItem` (`src/app/interfaces/generation-item.ts`) - Pokemon generation definition
- `GymLeader` (`src/app/interfaces/gym-leader.ts`) - Gym leader battle data
- `Badge` (`src/app/interfaces/badge.ts`) - Badge collection data
- `PokemonForm` (`src/app/interfaces/pokemon-form.ts`) - Form variant definition
- Purpose: Reusable helper functions
- Location: `src/app/utils/` and scattered helper files
- Contains: Utility functions (e.g., `odd-utils.ts` for probability calculations)
## Data Flow
- `GameStateService` maintains a stack of game states
- Each spin consumes a state from the stack
- `initializeStates()` pre-populates the stack with the full game flow
- Stack order determines game progression (e.g., character select → starter → gym battles)
- `finishCurrentState()` moves to next state in stack
- `repeatCurrentState()` re-runs current state (e.g., for item effects)
```
```
## Key Abstractions
- Purpose: Polymorphic base for all roulette selections
- Base: `WheelItem` (text, fillStyle, weight)
- Subclasses:
- Pattern: Used in all roulette components to define wheel segments
- Purpose: Standardized interface for all game decision wheels
- Pattern: Each roulette component:
- `StarterRouletteComponent` - Lists starters for selected generation
- `GymBattleRouletteComponent` - Lists gym leaders for generation
- `PokemonFromGenerationRouletteComponent` - Lists catchable Pokemon for generation
- Purpose: Control game progression
- Implementation: Stack-based state machine in `GameStateService`
- States: ~30 distinct game states (game-start, character-select, starter-pokemon, gym-battle, etc.)
- Transitions: Linear progression through pre-ordered state stack
- State types: Located in `src/app/services/game-state-service/game-state.ts`
- Purpose: Weighted random selection for all roulette outcomes
- Implementation: Each `WheelItem` has a `weight` property
- Algorithm: Canvas-based wheel segments scaled by weight; random angle selects segment
- Pattern: Used across all roulette components for fair randomization
## Entry Points
- Location: `src/main.ts`
- Triggers: Application startup
- Responsibilities: Bootstraps `AppComponent` with `appConfig`
- Location: `src/app/app.component.ts`
- Selector: `app-root`
- Triggers: When app loads
- Responsibilities:
- Location: `src/app/main-game/main-game.component.ts`
- Route: `/` (default)
- Triggers: Application navigation to home
- Responsibilities:
- Location: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Triggers: Game state changes
- Responsibilities:
## Error Handling
- Location: `src/app/services/pokemon-service/pokemon.service.ts`
- Implementation: RxJS `catchError` with retry logic
- Location: `src/app/main-game/roulette-container/roulette-container.component.ts`
- Implementation: Modal queue ensures dialogs display in order without blocking
- Fallback: All services provide root injection with `providedIn: 'root'`
- Ensures services are singletons and available application-wide
## Cross-Cutting Concerns
- Approach: console.log/error directly in services
- Location: PokeAPI errors, game state transitions
- Example: `console.error('Failed to fetch Pokémon...')`
- Pokemon existence: `PokemonService.getPokemonById()` returns `undefined` if not found
- Array safety: Filter functions check bounds (e.g., `filter((pokemon): pokemon is PokemonItem => pokemon !== undefined)`)
- State validation: `GameStateService` maintains ordered stack to prevent invalid transitions
- Not applicable (client-side game, no authentication required)
- Approach: ngx-translate with JSON translation files
- Location: `src/assets/i18n/` (EN, ES, FR, DE, IT, PT)
- Implementation:
- Approach: Observable-based dark mode toggle
- Location: `src/app/services/dark-mode-service/dark-mode.service.ts`
- Implementation: Detects system preference, stores preference in localStorage
- Used by: Components subscribe to `darkMode$` Observable for CSS class binding
- Approach: HTML5 Audio API wrapper
- Location: `src/app/services/sound-fx-service/sound-fx.service.ts`
- Types: Click sounds, item found sounds
- Implementation: Service manages audio playback with configurable volume
- Approach: Event tracking service
- Location: `src/app/services/analytics-service/analytics.service.ts`
- Events: Game loaded, events tracked for user engagement
- Implementation: Service wraps analytics calls (Google Analytics or similar)
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
