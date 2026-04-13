# Codebase Structure

**Analysis Date:** 2025-07-10

## Directory Layout

```
pokemon-roulette/
├── src/
│   ├── main.ts                          # Application bootstrap
│   ├── index.html                       # Root HTML (Angular entry)
│   ├── styles.css                       # Global stylesheet
│   └── app/
│       ├── app.component.ts/html/css    # Root shell — router-outlet + i18n init
│       ├── app.config.ts                # Application-level providers (router, HTTP, icons, i18n)
│       ├── app.routes.ts                # Route definitions
│       │
│       ├── main-game/                   # Primary game page (route: /)
│       │   ├── main-game.component.*    # Layout orchestrator
│       │   ├── EventSource.ts           # Union type for event origins
│       │   ├── coffee-button/           # Nav button → /coffee
│       │   ├── credits-button/          # Nav button → /credits
│       │   ├── end-game/                # Victory screen with fireworks + share
│       │   ├── game-over/               # Defeat/game-over screen
│       │   ├── generation-map/          # Town-map overlay (currently commented out)
│       │   ├── language-selector/       # Dropdown to change i18n language
│       │   └── roulette-container/      # State-machine-driven scene switcher
│       │       ├── roulette-container.component.*
│       │       └── roulettes/           # One sub-folder per GameState scene (28 total)
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
│       │
│       ├── trainer-team/                # Right-panel: trainer + team + badges
│       │   ├── trainer-team.component.*
│       │   ├── badges/                  # Badge display grid
│       │   ├── pokedex/                 # In-game Pokédex tab
│       │   └── storage-pc/             # PC storage box
│       │
│       ├── pokedex/                     # Pokédex feature (used by trainer-team/pokedex)
│       │   ├── pokedex-by-generation.ts # Static Pokédex data per gen
│       │   ├── pokedex-detail-modal/    # NgBootstrap modal for Pokémon detail
│       │   └── pokedex-entry/           # Single Pokédex list entry
│       │
│       ├── wheel/                       # Reusable spinning-wheel primitive
│       │   └── wheel.component.*
│       │
│       ├── items/                       # Item bag panel
│       │   └── items.component.*
│       │
│       ├── settings/                    # Settings page (route: /settings)
│       │   ├── settings.component.*
│       │   └── dark-mode-toggle/
│       │
│       ├── credits/                     # Credits page (route: /credits)
│       ├── coffee/                      # Support/coffee page (route: /coffee)
│       ├── not-found/                   # 404 page (route: **)
│       │
│       ├── main-game-button/            # Shared "back to game" button
│       ├── restart-game-buttom/         # Restart button (note: typo in folder name)
│       ├── settings-button/             # Settings nav button
│       │
│       ├── interfaces/                  # Shared TypeScript interfaces
│       │   ├── wheel-item.ts            # Base interface for all wheel segments
│       │   ├── pokemon-item.ts          # Extends WheelItem — Pokémon on wheel or team
│       │   ├── generation-item.ts       # Extends WheelItem — generation wheel segment
│       │   ├── item-item.ts             # Extends WheelItem — in-game items
│       │   ├── badge.ts                 # Gym badge
│       │   ├── gym-leader.ts            # Gym leader data shape
│       │   ├── language.ts              # i18n language option
│       │   ├── pokemon-form.ts          # Alternate Pokémon form
│       │   └── pokemon-type.ts          # Pokémon type enum + metadata
│       │
│       ├── services/                    # All injectable services
│       │   ├── analytics-service/       # Google Analytics gtag wrapper
│       │   ├── badges-service/          # Badge fetching + badges-data.ts
│       │   ├── dark-mode-service/       # Dark mode toggle (multi-file implementation)
│       │   ├── evolution-service/       # Evolution chain logic + evolution-chain.ts
│       │   ├── game-state-service/      # Stack-based state machine + game-state.ts
│       │   ├── generation-service/      # Current generation BehaviorSubject
│       │   ├── item-sprite-service/     # PokeAPI item sprite fetching
│       │   ├── items-service/           # Static item data + item-names.ts + items-data.ts
│       │   ├── modal-queue-service/     # Serialised NgBootstrap modal queue
│       │   ├── pokedex-service/         # Tracks seen/caught Pokémon
│       │   ├── pokemon-forms-service/   # Alternate form data + pokemon-forms.ts
│       │   ├── pokemon-service/         # PokeAPI sprite calls + national-dex-pokemon.ts
│       │   ├── rare-candy-service/      # Subject-based interrupt for Rare Candy use
│       │   ├── settings-service/        # Game settings persisted to localStorage
│       │   ├── sound-fx-service/        # Web Audio API sound effects
│       │   └── trainer-service/         # Trainer sprite, team, items, badges management
│       │
│       └── utils/
│           └── odd-utils.ts             # Bresenham interleave for wheel-item distribution
│
├── public/                              # Static assets served at root
│   ├── click.mp3                        # Wheel-tick sound
│   ├── ItemFound.mp3
│   ├── PCTurningOn.mp3
│   ├── PCLogin.mp3
│   ├── PCLogout.mp3
│   ├── place-holder-pixel.png           # Fallback sprite image
│   ├── qr_code.jpeg
│   └── favicon.ico
│
├── src/assets/i18n/                     # i18n translation files
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   ├── de.json
│   ├── it.json
│   └── pt.json
│
├── types/
│   └── dom-to-image-more.d.ts           # Type stub for dom-to-image-more library
│
├── angular.json                         # Angular CLI workspace config
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.spec.json
```

---

## Directory Purposes

**`src/app/main-game/`:**
- Purpose: The primary game screen; contains all gameplay UI components
- Key files: `main-game.component.ts` (layout), `EventSource.ts` (union type)

**`src/app/main-game/roulette-container/`:**
- Purpose: The central game-loop component; switches between roulette scenes based on `GameState`
- Key file: `roulette-container.component.ts` (imports all 28 roulette scenes, handles all game transitions)

**`src/app/main-game/roulette-container/roulettes/`:**
- Purpose: One folder per `GameState` value; each is a standalone component wrapping `WheelComponent`
- Pattern: Each folder typically contains `*.component.ts`, `*.component.html`, `*.component.css`, `*.component.spec.ts`, and optionally a `*-by-generation.ts` static data file
- Notable: `area-zero-roulette/area-zero-roulette.ts` omits the `component` infix (naming inconsistency)

**`src/app/services/`:**
- Purpose: All business logic, state, and I/O
- Pattern: Each service has its own sub-folder named `<service-name>-service/`; static data files (arrays, records) are co-located in that folder rather than in a separate `data/` directory

**`src/app/interfaces/`:**
- Purpose: Shared TypeScript interfaces used across components and services
- All interfaces are standalone `.ts` files (no barrel `index.ts`)

**`src/app/utils/`:**
- Purpose: Pure functions with no Angular dependencies
- Current content: `odd-utils.ts` (Bresenham-style wheel-item interleaving), `odd-utils.spec.ts`

**`src/app/trainer-team/`:**
- Purpose: Right-side panel group; `TrainerTeamComponent` hosts `BadgesComponent`, `StoragePcComponent`, `PokedexComponent` as sub-components

**`src/app/pokedex/`:**
- Purpose: Pokédex feature split from trainer-team for reusability; contains modal, entry, and static data

**`public/`:**
- Purpose: Static assets served directly at URL root (sound effects, placeholder images)
- Note: NOT `src/assets/` — audio files live here so they are referenced as `./click.mp3` etc.

**`src/assets/i18n/`:**
- Purpose: Translation JSON files loaded at runtime by `TranslateHttpLoader`
- Loaded via `./assets/i18n/{lang}.json` relative to the app origin

---

## Key File Locations

**Entry Points:**
- `src/main.ts` — Angular bootstrap
- `src/app/app.config.ts` — All provider configuration
- `src/app/app.routes.ts` — Route table

**Game State Machine:**
- `src/app/services/game-state-service/game-state.service.ts` — Stack logic and BehaviorSubjects
- `src/app/services/game-state-service/game-state.ts` — `GameState` union type (31 states)

**Trainer State:**
- `src/app/services/trainer-service/trainer.service.ts` — Team, items, badges, battle-form transforms

**Wheel Primitive:**
- `src/app/wheel/wheel.component.ts` — Canvas wheel; all roulettes use this

**Static Pokémon Data:**
- `src/app/services/pokemon-service/national-dex-pokemon.ts` — Full National Dex `PokemonItem[]`
- `src/app/services/evolution-service/evolution-chain.ts` — Evolution map `Record<id, id[]>`
- `src/app/main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation.ts` — Pokémon IDs per generation

**Generation-Specific Data (co-located in each roulette folder):**
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/starter-roulette/starter-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/legendary-roulette/legendaries-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-by-generation.ts`

**Interfaces:**
- `src/app/interfaces/wheel-item.ts` — Base wheel segment interface
- `src/app/interfaces/pokemon-item.ts` — Pokémon on team or wheel
- `src/app/interfaces/item-item.ts` — In-game items

**Settings & Persistence:**
- `src/app/services/settings-service/settings.service.ts` — Game settings; persists to `localStorage('pokemon-roulette-settings')`
- `src/app/services/dark-mode-service/dark-mode.service.ts` — Dark mode; persists to `localStorage`

**i18n:**
- `src/assets/i18n/en.json` — Reference translation (English)
- `src/app/main-game/language-selector/language-selector.component.ts` — Language picker

**Tests:**
- Co-located: `*.spec.ts` next to each component/service file
- Config: `tsconfig.spec.json`, Karma + Jasmine

---

## Naming Conventions

**Files:**
- Components: `<feature-name>.component.ts` (+ `.html`, `.css`, `.spec.ts`)
- Services: `<domain>.service.ts` (+ `.spec.ts`)
- Interfaces: `<entity>.ts` (no `.interface.ts` suffix)
- Static data files: `<data-description>.ts` (e.g., `national-dex-pokemon.ts`, `gym-leaders-by-generation.ts`)
- Types/unions: `<domain>.ts` (e.g., `game-state.ts`, `EventSource.ts`)
- Exception: `area-zero-roulette.ts` omits `.component` in the filename (inconsistency)
- Exception: `restart-game-buttom/` folder has a typo ("buttom" instead of "button")

**Directories:**
- Components: `kebab-case` matching the component selector minus `app-` prefix
- Services: `<domain>-service/` (always suffixed with `-service`)
- Roulette scenes: `<state-name>-roulette/` (matches the `GameState` value with hyphens)

**Angular Selectors:**
- All components use `app-` prefix: `app-wheel`, `app-trainer-team`, `app-roulette-container`
- Exception: `AreaZeroRoulette` selector is `app-area-zero-roulette` (matches convention despite filename inconsistency)

---

## Where to Add New Code

**New roulette scene (new `GameState`):**
1. Add the state name to `src/app/services/game-state-service/game-state.ts`
2. Create a folder: `src/app/main-game/roulette-container/roulettes/<state-name>-roulette/`
3. Create `<state-name>-roulette.component.ts/html/css/spec.ts` — import `WheelComponent`; define `WheelItem[]` items; emit `@Output()` events
4. Import and mount the component in `src/app/main-game/roulette-container/roulette-container.component.ts`
5. Add a handler in `RouletteContainerComponent` template/class for the new state and its outputs
6. Add the state to `initializeStates()` stack in `GameStateService` at the correct position

**New service:**
- Create `src/app/services/<domain>-service/<domain>.service.ts` with `@Injectable({ providedIn: 'root' })`
- Add a spec file alongside: `<domain>.service.spec.ts`

**New shared interface:**
- Add to `src/app/interfaces/<entity>.ts`
- Extend `WheelItem` if the interface represents a wheel segment

**New static data table (Pokémon by generation, leaders, etc.):**
- Co-locate with the roulette or service that uses it: `src/app/main-game/roulette-container/roulettes/<feature>/<data-name>.ts`
- Export a typed constant (array or record); do not place it in `services/` unless it is reused by multiple services

**New translation key:**
- Add to all six files in `src/assets/i18n/` (en, es, fr, de, it, pt)
- Reference in templates via `{{ 'my.key' | translate }}` or in TypeScript via `translateService.instant('my.key')`

**New audio asset:**
- Drop the `.mp3` file in `public/`
- Add a `create<Name>SoundFx()` factory method in `src/app/services/sound-fx-service/sound-fx.service.ts`

**New page route:**
- Create component in `src/app/<page-name>/`
- Register route in `src/app/app.routes.ts`

---

## Special Directories

**`public/`:**
- Purpose: Static files copied verbatim to the build output root; used for audio and placeholder images
- Generated: No
- Committed: Yes

**`dist/`:**
- Purpose: Angular CLI build output
- Generated: Yes (`ng build`)
- Committed: No (should be in `.gitignore`; used by `angular-cli-ghpages` for GitHub Pages deployment)

**`types/`:**
- Purpose: Custom `.d.ts` stubs for packages lacking TypeScript declarations
- Current content: `dom-to-image-more.d.ts`
- Committed: Yes

---

*Structure analysis: 2025-07-10*
