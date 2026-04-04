---
phase: 03-modal-navigation
plan: 01
subsystem: ui
tags: [angular, ngb-modal, pokedex, i18n, tdd, dark-mode]

# Dependency graph
requires:
  - phase: 02-pokedex-entry
    provides: PokedexEntryComponent (app-pokedex-entry) with 3-state flip-card cell
  - phase: 01-service-hooks
    provides: PokedexService.pokedex$, GenerationService.getGeneration(), PokemonService.nationalDexPokemon

provides:
  - PokedexComponent button + NgbModal with Local/National tabs and caught counter
  - bootstrapBook icon registered globally
  - pokedex.* i18n keys in all 6 locales

affects: [trainer-team, app-config, i18n-all-locales]

# Tech tracking
tech-stack:
  added: [bootstrapBook (@ng-icons/bootstrap-icons)]
  patterns:
    - ViewChild static:true for modal TemplateRef
    - String(id) key lookup for Record<string, T>
    - windowClass (not size) for custom Bootstrap modal classes
    - Subscription aggregation pattern (single Subscription instance)

key-files:
  created:
    - src/app/trainer-team/pokedex/pokedex.component.ts
    - src/app/trainer-team/pokedex/pokedex.component.html
    - src/app/trainer-team/pokedex/pokedex.component.css
    - src/app/trainer-team/pokedex/pokedex.component.spec.ts
  modified:
    - src/app/trainer-team/trainer-team.component.html
    - src/app/trainer-team/trainer-team.component.ts
    - src/app/app.config.ts
    - src/assets/i18n/en.json
    - src/assets/i18n/es.json
    - src/assets/i18n/fr.json
    - src/assets/i18n/de.json
    - src/assets/i18n/it.json
    - src/assets/i18n/pt.json

key-decisions:
  - "Used @ViewChild({ static: true }) so modal TemplateRef is available on first openPokedex() call"
  - "String(id) key lookup in caughtCount getter — PokedexService stores caught as Record<string, PokedexEntry>"
  - "windowClass: 'modal-fullscreen-sm-down' (not size) for mobile full-screen behavior"
  - "Raw Bootstrap nav-tabs (not NgbNavModule) — consistent with project pattern"
  - "bootstrapBook added to both import statement AND provideIcons() in app.config.ts"

patterns-established:
  - "PokedexComponent mirrors StoragePcComponent: single Subscription, ngOnDestroy cleanup"
  - "Modal opened via NgbModal.open(templateRef, options) with windowClass for mobile"

requirements-completed: [NAV-01, NAV-02, NAV-03, NAV-04, NAV-05]

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 03 Plan 01: Modal Navigation Summary

**Tabbed Pokédex modal (Local Dex / National Dex) with live caught counter, dark-mode support, and mobile full-screen — wired into trainer-team area alongside the PC button.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-03T23:42:23Z
- **Completed:** 2026-04-03T23:45:44Z
- **Tasks:** 3/3
- **Files modified:** 13

## Accomplishments

- Created `PokedexComponent` with NgbModal, tabbed Local/National Dex, live caught counter, dark-mode styling, and mobile full-screen (`modal-fullscreen-sm-down`)
- Wired `<app-pokedex>` into trainer-team alongside `<app-storage-pc>` with `d-flex gap-2`
- Registered `bootstrapBook` icon globally (import + provideIcons) and added `pokedex.*` i18n keys to all 6 locale files (en/es/fr/de/it/pt)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PokedexComponent (spec RED → implementation GREEN)** - `f9a6dca` (feat)
2. **Task 2: Wire integrations — trainer-team, app.config.ts, all 6 i18n files** - `03fda19` (feat)
3. **Task 3: Phase gate verification** — no code changes, verified by tests + build

## Files Created/Modified

- `src/app/trainer-team/pokedex/pokedex.component.ts` — PokedexComponent class: ViewChild static:true, subscriptions, openPokedex, caughtCount getter (String(id))
- `src/app/trainer-team/pokedex/pokedex.component.html` — Button + ng-template modal: nav-tabs, caught counter, pokedex-entry grid
- `src/app/trainer-team/pokedex/pokedex.component.css` — Scrollable modal-body, flex-wrap pokedex-grid
- `src/app/trainer-team/pokedex/pokedex.component.spec.ts` — 7 specs covering NAV-01 through NAV-05
- `src/app/trainer-team/trainer-team.component.html` — Added `d-flex gap-2` + `<app-pokedex>` alongside `<app-storage-pc>`
- `src/app/trainer-team/trainer-team.component.ts` — Added PokedexComponent import + to imports[]
- `src/app/app.config.ts` — Added bootstrapBook to import and provideIcons()
- `src/assets/i18n/en.json` — Added pokedex.* keys
- `src/assets/i18n/es.json` — Added pokedex.* keys (Spanish)
- `src/assets/i18n/fr.json` — Added pokedex.* keys (French)
- `src/assets/i18n/de.json` — Added pokedex.* keys (German)
- `src/assets/i18n/it.json` — Added pokedex.* keys (Italian)
- `src/assets/i18n/pt.json` — Added pokedex.* keys (Portuguese)

## Verification Results

| Check | Result |
|-------|--------|
| `ng test` — 141 specs, 0 failures | ✅ PASS |
| `ng build --configuration development` | ✅ PASS |
| `grep -c "app-pokedex" trainer-team.component.html` = 1 | ✅ PASS |
| `grep -c "bootstrapBook" app.config.ts` = 2 | ✅ PASS |
| All 6 i18n files have `pokedex` key | ✅ PASS |

## Deviations from Plan

None — plan executed exactly as written. All critical pitfalls applied as specified:
- `@ViewChild('pokedexModal', { static: true })` — mandatory for first-click access
- `String(id)` in caughtCount getter — matches service's string-keyed Record
- `windowClass: 'modal-fullscreen-sm-down'` — not `size`
- `bootstrapBook` in both import statement and `provideIcons()`
- All 6 i18n locales updated

## Known Stubs

None — all data is live from services (PokedexService.pokedex$, GenerationService, PokemonService.nationalDexPokemon).

## Self-Check: PASSED
