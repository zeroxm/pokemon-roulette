<!-- GSD:project-start source:PROJECT.md -->
## Project

**Pokemon Roulette — Milestone 1: Low-Severity Technical Debt**

A browser-based Pokemon roulette game built with Angular 21. Players spin randomized wheels to
determine their Pokemon team, battles, and adventure path through a generation of their choice.
This milestone focuses exclusively on eliminating all Low-severity concerns identified in the
codebase audit, keeping the game fully playable throughout.

**Core Value:** The game must stay green (compilable, testable, and playable) after every change — no concern fix
should introduce a regression.

### Constraints

- **Tech Stack**: Angular 21 + TypeScript strict mode — no framework changes
- **Compatibility**: Must pass the existing GitHub Actions CI pipeline after each phase
- **Scope**: Low-severity concerns only in this milestone; Medium/High deferred
- **Safety**: Each concern fix committed atomically; system stays buildable and testable
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- **TypeScript** ~5.9.3 — All application source code (`src/**/*.ts`)
- **HTML** — Angular component templates (`src/app/**/*.html`)
- **CSS** — Component styles and global styles (`src/styles.css`, `src/app/**/*.css`)
## Runtime & Platform
- **Node.js** 24.x — Build and CI runtime (per `.github/workflows/node.js.yml`)
- **Browser** — Target deployment platform; uses `localStorage`, `AudioContext`, `Canvas` APIs
## Frameworks & Libraries
### Core
- **Angular** ^21.2.7 — Primary SPA framework (standalone components, signals-ready)
- **RxJS** ~7.8.2 — Reactive state management via `BehaviorSubject`, `Observable`; used throughout all services
### UI / Frontend
- **Bootstrap** ^5.3.8 — CSS utility/component framework (loaded via `angular.json` styles)
- **@ng-bootstrap/ng-bootstrap** ^20.0.0 — Angular Bootstrap components (`NgbModal`, `NgbCollapseModule`); used in `wheel.component.ts`, `main-game.component.ts`
- **@ng-icons/core** ^33.2.0 — Icon system (registered in `src/app/app.config.ts`)
- **@ng-icons/bootstrap-icons** ^33.2.0 — Bootstrap icon set (11 icons registered: `bootstrapArrowRepeat`, `bootstrapCheck`, `bootstrapClock`, etc.)
- **@popperjs/core** ^2.11.8 — Tooltip/popover positioning (Bootstrap dependency)
- **fireworks-js** ^2.10.8 — Canvas-based fireworks animation; used in `src/app/main-game/end-game/end-game.component.ts`
- **dom-to-image-more** ^3.7.2 — DOM-to-image screenshot export; used in `src/app/main-game/end-game/end-game.component.ts` and `src/app/main-game/game-over/game-over.component.ts`
### Internationalization
- **@ngx-translate/core** ^17.0.0 — Runtime i18n translation service (`TranslateService`, `TranslateModule`, `TranslatePipe`)
- **@ngx-translate/http-loader** ^17.0.0 — HTTP-based JSON translation loader; loads from `./assets/i18n/{lang}.json`
### Dev Dependencies
- **@angular/cli** ^21.2.6 — CLI tooling (`ng serve`, `ng build`, `ng test`)
- **@angular-devkit/build-angular** ^21.2.6 — Application builder
- **angular-cli-ghpages** ^3.0.2 — GitHub Pages deployment (`ng deploy`)
- **Karma** ~6.4.4 — Test runner (browser-based)
- **karma-chrome-launcher** ~3.2.0 — Chrome/ChromeHeadless launcher for CI
- **karma-coverage** ~2.2.1 — Code coverage reporting
- **karma-jasmine** ~5.1.0 — Jasmine test framework bridge
- **karma-jasmine-html-reporter** ~2.2.0 — HTML test report
- **Jasmine** ~6.1.0 — Test assertion/suite framework (`@types/jasmine` ~6.0.0)
- **TypeScript** ~5.9.3 — Compiler
## Build & Tooling
- **Angular CLI / `@angular-devkit/build-angular`** — Application bundler using `@angular-devkit/build-angular:application` builder
- **`ng serve`** — Dev server on `0.0.0.0:4200`
- **`ng build --watch`** — Watch mode for development
- **`ng test`** — Karma test runner
- **`angular-cli-ghpages`** — `ng deploy` pushes built output to GitHub Pages
- **GitHub Actions** — CI pipeline (`.github/workflows/node.js.yml`): runs `npm ci`, `ng build`, `ng test --watch=false --browsers=ChromeHeadless` on push/PR to `main`
## Configuration Files
- `package.json` — Dependencies and npm scripts
- `package-lock.json` — Dependency lockfile (npm)
- `angular.json` — Angular workspace config (builders, assets, styles, budgets, deploy)
- `tsconfig.json` — Base TypeScript config (ES2022 target/module, strict mode, `bundler` resolution)
- `tsconfig.app.json` — App-specific TS config (extends base, resolves JSON modules, `@angular/localize` types)
- `tsconfig.spec.json` — Test-specific TS config
- `src/environments/environment.ts` — Development environment config (`production: false`, `googleAnalyticsId`)
- `src/environments/environment.prod.ts` — Production environment config (`production: true`, `googleAnalyticsId`)
- `.editorconfig` — Editor formatting: 2-space indent, single quotes for TS, UTF-8
- `.github/workflows/node.js.yml` — GitHub Actions CI workflow
- `src/styles.css` — Global CSS entry point
- `types/dom-to-image-more.d.ts` — Custom type declaration for `dom-to-image-more`
## Environment Variables
- `environment.googleAnalyticsId` — Google Analytics measurement ID (`G-40CS5XD7G9`); hardcoded in `src/environments/environment.ts` and `src/environments/environment.prod.ts`
- `environment.production` — Boolean flag swapped at build time via `angular.json` `fileReplacements`
## TypeScript Configuration
- Target: `ES2022`, Module: `ES2022`
- Strict mode fully enabled: `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Angular strict templates: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`
- `experimentalDecorators: true` (required for Angular decorators)
- `moduleResolution: "bundler"` (Angular v21 standard)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- **Indentation:** 2 spaces (enforced via `.editorconfig`)
- **Quotes:** Single quotes for TypeScript strings (`quote_type = single` in `.editorconfig`)
- **Trailing whitespace:** Trimmed automatically (`.editorconfig`)
- **Final newline:** Required on all files
- **TypeScript strict mode:** Enabled — `strict: true`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature` all active (`tsconfig.json`)
- **Angular strict templates:** `strictTemplates: true`, `strictInjectionParameters: true` (`tsconfig.json`)
## Naming
- camelCase: `private stateStack`, `currentRound`, `wheelSpinning`
- Boolean observables/state use descriptive names: `wheelSpinning`, `showChoiceButtons`
- Subjects end with `$` suffix: `private settingsSubject$: BehaviorSubject<GameSettings>` (`src/app/services/settings-service/settings.service.ts`)
- Observables exposed publicly drop the `$` or end with `Observable`/`Observer`: `currentState`, `currentRoundObserver`, `settings$` (mixed pattern)
- camelCase: `finishCurrentState()`, `toggleMuteAudio()`, `getPokemonByIdArray()`
- Event handlers prefixed with `on`: `onItemSelected()`, `onGenerationChosen()`
- Boolean toggles use `toggle` prefix: `toggleMuteAudio()`, `toggleSkipShinyRolls()`
- Private methods use `private` keyword, not underscore convention
- PascalCase: `GameStateService`, `RouletteContainerComponent`, `PokemonService`
- PascalCase, no `I` prefix: `WheelItem`, `PokemonItem`, `GameSettings`
- Interfaces in `src/app/interfaces/` directory with one interface per file
- kebab-case with Angular type suffix:
- Class-level constants: `UPPER_SNAKE_CASE` — `NINCADA_ID = 290` (`src/app/main-game/roulette-container/roulette-container.component.ts`)
- `private readonly` for class-level config strings: `private readonly STORAGE_KEY = 'pokemon-roulette-settings'`
- `private readonly apiBaseUrl = '...'` for URLs
- PascalCase: `export type PokemonType = ...`, `export type GameState = ...`, `export type EventSource = ...`
## Angular-Specific Patterns
## State Management Pattern
## Error Handling
## Common Patterns
### Interface Inheritance (WheelItem base)
### Event-Driven State Machine
### Stack-Based State Navigation
### JSDoc Comments
### Deep Cloning
### Type-Safe Filter Guards
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
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
### Game Orchestration Layer
- **Purpose:** Coordinates the active game state, mediates between roulette outcomes and service calls, handles modal flow
- **Key files:**
### Roulette Sub-Components (Game Screens)
- **Purpose:** Each roulette represents one game event/decision point. Renders a `WheelComponent`, defines available actions as `WheelItem[]`, emits typed `@Output()` events on spin result
- **Location:** `src/app/main-game/roulette-container/roulettes/`
- **28 roulettes including:**
### Shared UI Components
- **Purpose:** Reusable UI elements used across page components
- **Key files:**
### Services Layer
- **Purpose:** Injectable singleton services providing state, data access, and business logic
- **Location:** `src/app/services/`
- **Key services:**
### Data / Interfaces Layer
- **Purpose:** TypeScript interfaces and static data
- **Key files:**
### Utils
- **Purpose:** Pure utility functions
- **Key files:** `src/app/utils/odd-utils.ts` — Probability/odds helpers
## Data Flow
### Game State Progression
### Pokemon Data Flow
### State Observable Pattern
## Key Abstractions
- `GameState` (union type) in `src/app/services/game-state-service/game-state.ts` — 30+ string literals representing every possible game moment
- `WheelItem` interface in `src/app/interfaces/wheel-item.ts` — Base segment: `{ text: string, fillStyle: string, weight: number }`
- `PokemonItem` interface in `src/app/interfaces/pokemon-item.ts` — Extends `WheelItem`, adds `pokemonId`, types, sprite URLs, `shiny`, `power`
- `EventSource` type in `src/app/main-game/EventSource.ts` — Context tag for battle events (e.g., `'gym-battle'`, `'rare-candy'`)
- `GameStateService` in `src/app/services/game-state-service/game-state.service.ts` — Stack-based state machine with BehaviorSubject observables
- `WheelComponent` in `src/app/wheel/wheel.component.ts` — Reusable canvas wheel; takes `WheelItem[]` input, emits `selectedItemEvent: number`
## Component Hierarchy
```
```
## Error Handling
- `PokemonService.getPokemonSprites()` — `retry({ count: 3, delay: 1000 })` then `catchError` → `throwError`
- Placeholder sprite `'place-holder-pixel.png'` used when sprite is null/unavailable
- `bootstrapApplication(...).catch(err => console.error(err))` in `main.ts`
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.github/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

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
