# Phase 2 — Plan 01 Summary

## What Was Built

`PokedexEntryComponent` at `src/app/pokedex/pokedex-entry/` — a compact (~40px) standalone Angular component rendering a single Pokémon in three visual states.

## Artifacts Created

| File | Purpose |
|------|---------|
| `pokedex-entry.component.ts` | Component class — 2 inputs, 4 getters, 1 formatting method |
| `pokedex-entry.component.html` | Flip card template with number badge and ngbTooltip |
| `pokedex-entry.component.css` | 40px cell, preserve-3d flip, gold won border, webkit prefixes |
| `pokedex-entry.component.spec.ts` | 15 Jasmine tests, VIS-01 through VIS-06 |

## Key Decisions Implemented

- D-01: 40px compact cell (grid sizing is Phase 3's concern)
- D-02: Number badge overlaid top-left, absolute-positioned sibling of flip inner
- D-03: ngbTooltip with | translate; '???' when unseen
- D-04/05: unknown.png front face; front_default sprite back face with loading=lazy
- D-06: Gold border + box-shadow for won state (no star badge)
- D-07: Pure CSS rotateY(180deg) flip, 0.4s ease, no @angular/animations
- D-08: Native loading="lazy" only
- D-09: @Input() pokemonId + @Input() entry: PokedexEntry | undefined
- D-10: (darkMode | async) ? 'border' : 'black-border shadow'

## Test Results

- Phase 2 component tests: 15/15 PASS
- Full suite: 134/134 PASS (zero regressions)
- TypeScript build: zero errors

## Deviations

**[Rule 3 - Blocking Issue] `--include` flag incompatible with external template/style files**

- **Found during:** RED phase verification
- **Issue:** `ng test --include="**/pokedex-entry/**"` caused webpack "Module parse failed" errors for `.html` and `.css` files — the `--include` flag in this project's Angular/Karma/webpack setup does not properly process external `templateUrl`/`styleUrl` files when isolating specs.
- **Fix:** Used `ng test --no-watch --browsers=ChromeHeadless` (full suite) instead. All 15 new tests ran successfully alongside the 119 existing tests (134 total).
- **Impact:** None — all tests pass; workaround is documented for future plans.
