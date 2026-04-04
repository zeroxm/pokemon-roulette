# Phase 3: Modal & Navigation — Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Pokédex modal and wire it into the game UI. This phase assembles Phase 2's `PokedexEntryComponent` cells into a navigable grid inside an `NgbModal`, adds the Pokédex button to the trainer-team area, and connects all live data from `PokedexService` and `GenerationService`.

Deliverables:
- `PokedexComponent` (`src/app/trainer-team/pokedex/`) — self-contained component with button + modal template
- `<app-pokedex>` added to `trainer-team.component.html` alongside `<app-storage-pc>`
- Local Dex tab: current generation's Pokémon grid (from `pokemonByGeneration`)
- National Dex tab: all 1,025 Pokémon grid (from `nationalDexPokemon`)
- Progress counter per tab: `Caught: X / Y`
- Mobile full-screen (Bootstrap `modal-fullscreen-sm-down`)
- Dark mode support

Success is verifiable by clicking the Pokédex button, seeing the modal with Local/National tabs, and confirming caught Pokémon show their sprites while unseen ones show `unknown.png`.

</domain>

<decisions>
## Implementation Decisions

### Component Architecture

- **D-01:** New standalone `PokedexComponent` at `src/app/trainer-team/pokedex/`
  - Follows `StoragePcComponent` pattern exactly: `@ViewChild` template ref, `NgbModal` injection, `ngOnInit` subscriptions, `ngOnDestroy` cleanup
  - Self-contained: owns both the button and the `<ng-template #pokedexModal>` inline
  - Directory: `src/app/trainer-team/pokedex/pokedex.component.ts` (and `.html`, `.css`, `.spec.ts`)

- **D-02:** `<app-pokedex>` placed in `trainer-team.component.html` alongside `<app-storage-pc>`
  - Both components sit in the same `col-12 p-0` row — they share horizontal space
  - `trainer-team.component.ts` imports `PokedexComponent` in its `imports[]` array

### Tabs

- **D-03:** **Local Dex tab active by default** when modal opens
  - Active tab state managed by a component property: `activeTab: 'local' | 'national' = 'local'`
  - Tab switching via `(click)="activeTab = 'local'"` / `(click)="activeTab = 'national'"`
  - Use Bootstrap nav-tabs pattern (same as existing modal patterns in the app)
  - Local Dex Pokémon IDs: `pokemonByGeneration[currentGenerationId]` from `GenerationService`
  - National Dex Pokémon IDs: `pokemonService.nationalDexPokemon.map(p => p.pokemonId)`

### Progress Counter

- **D-04:** Single `Caught: X / Y` counter per tab
  - "Caught" = seen count (presence of `entry` in `PokedexData.caught[id]`)
  - X = number of IDs in the current tab's list that have an entry in `caught`
  - Y = total count of IDs in the current tab's list
  - Updates reactively via `pokedex$` async pipe — no manual subscription needed
  - Format: `Caught: {{ caughtCount }} / {{ totalCount }}`
  - Computed via getter methods that derive from `PokedexData` and the active Pokémon ID list

### Grid Layout (8 cols desktop / 5 cols mobile)

- **D-05:** Flexbox grid with `flex-wrap: wrap` and fixed cell widths
  - Desktop (≥577px): 8 cells per row → cell width `calc((100% - 7 * 4px) / 8)` or ~12.5% - gap
  - Mobile (≤576px): 5 cells per row → cell width `calc((100% - 4 * 4px) / 5)`
  - `gap: 4px` between cells
  - `PokedexEntryComponent` already has `flex-shrink: 0` and `width: 40px; height: 40px`
  - Grid wraps in a scrollable `modal-body` container

### Modal Structure

- **D-06:** Modal header with "Pokédex" title + close button
  - `<div class="modal-header">` with `<h4 class="modal-title">{{ 'pokedex.title' | translate }}</h4>` and close button
  - Tabs immediately below the header inside `modal-body`

- **D-07:** `modal-fullscreen-sm-down` on the modal root for mobile full-screen (NAV-04)
  - Pass `{ windowClass: 'modal-fullscreen-sm-down' }` or use `modalOptions` in `NgbModal.open()`

- **D-08:** Dark mode in modal body
  - Modal header: `[ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''"` (pattern from existing modals)
  - Modal body: same dark mode `[ngClass]` pattern

### Data Flow

- **D-09:** `PokedexComponent` subscribes to both:
  1. `pokedexService.pokedex$` → `pokedexData: PokedexData` (reactive — updates grid live)
  2. `generationService.getGeneration()` → `currentGenerationId: number` (for Local Dex IDs)
  - Both stored as `Observable` fields consumed via `async` pipe in template (no manual `subscribe`)
  - Or: store as component fields updated in `ngOnInit` subscriptions (StoragePcComponent pattern)
  - **Agent's discretion:** Either approach works. Match `StoragePcComponent` subscription pattern for consistency.

### i18n Key

- **D-10:** Add i18n key for Pokédex button and modal title
  - Key: `'pokedex.title'` → `"Pokédex"` (English)
  - Key: `'pokedex.button'` → `"Pokédex"` (button label, same text but separate key for flexibility)
  - Key: `'pokedex.tab.local'` → `"Local Dex"`
  - Key: `'pokedex.tab.national'` → `"National Dex"`
  - Key: `'pokedex.caught'` → `"Caught:"`
  - Add to all `src/assets/i18n/*.json` files (en, es, fr, de, it, pt)
  - For non-English translations, the agent may use `"Pokédex"` as-is (it's a proper noun)

### the agent's Discretion

- Whether to use `NgbNavModule` (Bootstrap nav component) or raw Bootstrap nav-tabs HTML for tabs — either works; raw Bootstrap HTML is simpler and matches the existing modal style
- Exact `NgbModal.open()` options (size, backdrop, keyboard) — match `StoragePcComponent.showPCModal()` options
- Whether to extract `caughtCount` / `totalCount` as `computed` signals or getters — plain getters are consistent with Phase 1/2 patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary Blueprints
- `src/app/trainer-team/storage-pc/storage-pc.component.ts` — **Mirror this exactly**: `@ViewChild`, `NgbModal.open()`, `Subscription` container, `ngOnDestroy`, dark mode pattern
- `src/app/trainer-team/storage-pc/storage-pc.component.html` — Modal template structure: `<ng-template>`, `modal-body`, dark mode `[ngClass]`
- `src/app/trainer-team/trainer-team.component.html` — Where to add `<app-pokedex>` (alongside `<app-storage-pc>`)
- `src/app/trainer-team/trainer-team.component.ts` — How to add `PokedexComponent` to `imports[]`

### Data Sources
- `src/app/services/pokedex-service/pokedex.service.ts` — `PokedexData`, `pokedex$` Observable (Phase 1)
- `src/app/pokedex/pokedex-entry/pokedex-entry.component.ts` — `PokedexEntryComponent` with `@Input() pokemonId` + `@Input() entry` (Phase 2)
- `src/app/main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation.ts` — `pokemonByGeneration: Record<number, number[]>` for Local Dex
- `src/app/services/pokemon-service/pokemon.service.ts` — `nationalDexPokemon` array + `getPokemonById()` for National Dex
- `src/app/services/generation-service/` — `getGeneration(): Observable<GenerationItem>` for current gen ID

### i18n
- `src/assets/i18n/en.json` — Reference file for adding new `pokedex.*` keys (D-10)
- All other `src/assets/i18n/*.json` files — must also receive the new keys

### Requirements
- `.planning/REQUIREMENTS.md` — NAV-01 through NAV-05 are the acceptance criteria for this phase

</canonical_refs>

<specifics>
## Specific Ideas

- `PokedexComponent` selector: `app-pokedex`
- Button style matches PC button: `class="btn"` + dark mode `[ngClass]` (outline-light / outline-dark)
- Button icon: ng-bootstrap icon (e.g., `bootstrapBook` or `bootstrapGrid3x3Gap`) — agent's discretion
- The `pokemonByGeneration` object key is the generation number (1–9) matching `GenerationItem.id`
- `nationalDexPokemon` has 1,025 entries; the IDs are not contiguous (some generations skip IDs)
- The `modal-body` needs `max-height: calc(100vh - 200px); overflow-y: auto` for desktop scrolling
- On mobile (`modal-fullscreen-sm-down`), `max-height` is not needed — full-screen handles scroll
- The `Caught: X / Y` counter sits between the tab buttons and the grid

</specifics>

<deferred>
## Deferred Ideas

- Per-run Pokédex reset — explicitly out of scope (PROJECT.md)
- Filtering or searching the Pokédex — deferred to next iteration
- Pokédex entry details (types, stats) — future iteration
- Completion reward/notification — deferred

</deferred>

---
*Phase: 03-modal-navigation*
*Context gathered: 2026-04-03 via /gsd-discuss-phase 3*
