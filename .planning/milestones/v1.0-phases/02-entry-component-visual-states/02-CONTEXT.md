# Phase 2: Entry Component & Visual States — Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build `PokedexEntryComponent` — the individual Pokédex cell that renders a single Pokémon across three visual states: unseen, seen, and won. This is the visual atom Phase 3's grid and modal will compose.

Deliverables:
- `PokedexEntryComponent` (`src/app/pokedex/pokedex-entry/`) — standalone Angular component
- Three visual states driven by `PokedexData` from `PokedexService.pokedex$`
- Lazy sprite loading via native `loading="lazy"` — no PokeAPI call for unseen entries
- CSS flip card animation on unseen→seen transition (while modal is open)

**No modal, no tabs, no button — those are Phase 3.**

Success is verifiable by opening a Pokédex grid (can be a standalone test route or hardcoded in a dev page) and confirming:
- Unseen cells show `unknown.png`, number badge, and `???` tooltip
- Seen cells show `front_default` sprite and Pokémon name tooltip
- Won cells show `front_default` sprite + gold glowing border
- Catching a Pokémon while the component is visible triggers the flip animation

</domain>

<decisions>
## Implementation Decisions

### Grid Density

- **D-01:** Compact grid — **8 columns on desktop / 5 columns on mobile** (~40px cells)
  - Inspired by classic Gen 1 Pokédex grid density
  - Breakpoint: ≤576px (Bootstrap `sm`) → 5 cols; ≥577px → 8 cols

### Cell Layout

- **D-02:** **Number badge overlaid top-left** (absolute-positioned, small ~10px text)
  - Format: `#001`, `#025`, `#1011` (leading zeros up to 3 digits; IDs > 999 use 4 digits)
  - Always visible regardless of seen/won state (VIS-04)
  - Implementation: `position: absolute; top: 2px; left: 2px` on a small badge element

- **D-03:** **Name shown via `ngbTooltip`** (already used in trainer-team for Pokémon names)
  - Seen: shows actual Pokémon name (use `pokemonService.getPokemonById(id).text` → i18n key via `translate` pipe)
  - Unseen: shows `???` (classic Gen 1 Pokédex style)
  - `placement="bottom"` consistent with trainer-team usage

### Visual States

- **D-04:** Unseen state (VIS-01):
  - Image: `unknown.png` at `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png`
  - No lazy loading needed for this image — it's a single shared asset (can be cached by browser)
  - Tooltip: `???`

- **D-05:** Seen state (VIS-02):
  - Image: `front_default` sprite URL from `PokedexData.caught[id].sprite` (already stored in localStorage by Phase 1)
  - `loading="lazy"` on `<img>` — browser handles viewport intersection natively
  - No `<img>` rendered for unseen (avoids any HTTP call); only `unknown.png` shown
  - Tooltip: actual Pokémon name

- **D-06:** Won state (VIS-03):
  - Visual: **Gold glowing border** on the cell — `border-color: gold` + `box-shadow: 0 0 6px rgba(255, 215, 0, 0.7)`
  - NOT a star badge — the golden border is cleaner at compact 40px cell size
  - Applies ON TOP OF seen state (won implies seen)

### Reveal Animation (VIS-06)

- **D-07:** **3D CSS flip card** — horizontal flip on unseen→seen transition
  - Implementation:
    ```css
    .pokedex-cell { perspective: 200px; }
    .pokedex-cell-inner { transform-style: preserve-3d; transition: transform 0.4s ease; }
    .pokedex-cell.seen .pokedex-cell-inner { transform: rotateY(180deg); }
    .pokedex-cell-front, .pokedex-cell-back { backface-visibility: hidden; position: absolute; }
    .pokedex-cell-back { transform: rotateY(180deg); }
    ```
  - Front face: `unknown.png`; Back face: `front_default` sprite
  - Animation only fires when state transitions from unseen→seen (Angular `@Component` `OnChanges` or direct class binding via async pipe)
  - No animation if cell was already seen when modal opened (starts in seen state directly)

### Lazy Loading Strategy

- **D-08:** Use **native `loading="lazy"` attribute** on seen/won `<img>` elements
  - No CDK Virtual Scroll, no IntersectionObserver — browser native handles viewport detection
  - The `unknown.png` has a fixed URL (no lazy needed); the `front_default` URL is already stored in `caught[id].sprite`
  - No HTTP call to PokeAPI at render time — Phase 1 already stored the URL deterministically

### Component API

- **D-09:** `PokedexEntryComponent` receives two `@Input()`s:
  - `pokemonId: number` — the Pokémon's national Dex ID
  - `entry: PokedexEntry | undefined` — from `PokedexData.caught[id]` (undefined = unseen)
  - Computes state: `unseen` (no entry), `seen` (entry with won=false), `won` (entry with won=true)
  - Does NOT subscribe to `pokedex$` internally — parent passes the slice; keeps the component pure/testable

### Dark Mode

- **D-10:** Follow the established pattern: `[ngClass]="(darkMode | async) ? 'border' : 'black-border shadow'"` for the cell border
  - Won state adds gold glow on top regardless of dark mode
  - Inject `DarkModeService` the same way other components do (via `async` pipe in template)

### the agent's Discretion

- Exact CSS sizing (cell width, border-radius, padding) — follow PC Storage card style at smaller size
- Whether `PokedexEntryComponent` is standalone (preferred: yes, all new components are standalone in this codebase)
- Test file structure — follow `settings.service.spec.ts` and `storage-pc.component.spec.ts` patterns
- Number badge formatting logic (3-digit zero-padding vs 4-digit for IDs >999) — implement as a pure formatting function in component

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary Blueprints
- `src/app/trainer-team/storage-pc/storage-pc.component.html` — **Grid pattern to mirror**: `pokemon-storage-grid` flexbox layout, `pokemon-storage-card` card styling, dark mode `[ngClass]` pattern, `ngbTooltip` usage
- `src/app/trainer-team/storage-pc/storage-pc.component.css` — Card sizing, mobile breakpoint, shadow pattern
- `src/app/trainer-team/trainer-team.component.html` — Dark mode `[ngClass]` pattern with `darkMode | async`

### Data Sources
- `src/app/services/pokedex-service/pokedex.service.ts` — `PokedexEntry`, `PokedexData` interfaces; `pokedex$` Observable (Phase 1 output)
- `src/app/services/pokemon-service/pokemon.service.ts` — `getPokemonById(id)` returns `PokemonItem` with `.text` (i18n key for name)
- `src/app/services/dark-mode-service/dark-mode.service.ts` — `darkMode$: Observable<boolean>` for template dark mode binding

### Visual State Assets
- `unknown.png` URL: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png` (hardcoded in roulette-container at lines 262, 282, 292)
- `front_default` sprite URL: stored in `PokedexData.caught[id].sprite` (set by `PokedexService.markSeen`)

### Requirements
- `.planning/REQUIREMENTS.md` — VIS-01 through VIS-06 are the acceptance criteria for this phase

</canonical_refs>

<specifics>
## Specific Ideas

- Cell size target: ~40px × 40px (compact, classic Pokédex feel)
- 8 columns on desktop via `flex: 0 0 calc(100% / 8)` or Bootstrap col equivalent
- 5 columns on mobile (`@media (max-width: 576px)`) → `flex: 0 0 calc(100% / 5)`
- Number format: `#` + zero-padded to 3 digits for IDs 1–999, no padding for IDs 1000+ (`#1011`, not `#1011`)
- The `ngbTooltip` directive is already imported in components — import from `@ng-bootstrap/ng-bootstrap`
- `loading="lazy"` is a standard HTML attribute, not Angular-specific — works with `[src]` binding on `<img>`
- Phase 3 will pass an array of `pokemonId` values to a grid; Phase 2 builds the single cell

</specifics>

<deferred>
## Deferred Ideas

- Filtering/searching the Pokédex grid — explicitly out of scope (PROJECT.md)
- Pokédex entry details (types, stats, description) — future iteration
- Shiny sprite tracking — out of scope
- Sound effect on flip animation — nice-to-have, Phase 3 or later
- Completion reward/notification — deferred to a later version

</deferred>

---
*Phase: 02-entry-component-visual-states*
*Context gathered: 2026-04-03 via /gsd-discuss-phase 2*
