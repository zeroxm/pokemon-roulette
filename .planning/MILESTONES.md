# Milestones

## v1.0 Pokédex Feature (Shipped: 2026-04-03)

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**

- Persistent Pokédex service with localStorage — survives browser restarts across all game sessions
- Tabbed Pokédex modal (Local Dex / National Dex) with live caught counter, dark-mode support, and mobile full-screen
- Lazy-loading sprite reveal: unknown.png until Pokémon is seen, front_default sprite on flip animation
- Wired to roulette, trade, steal, and evolution events via markSeen hooks

## v1.1 Pokédex Corrections (Shipped: 2026-04-03)

**Phases completed:** 2 phases, 4 plans, 15 files, +524 LOC

**Key accomplishments:**

- Fixed button row layout: PC and Pokédex buttons now at opposite ends (justify-content-between)
- Pokédex grid constrained to 9 cols desktop (392px) / 6 cols mobile (260px) via CSS max-width
- Evolution hooks: markSeen added to replaceForEvolution() — covers all evolution paths in one insertion
- Trade hook: markSeen added to performTrade() — received Pokémon registered instantly
- Complete national dex data (pokedex-by-generation.ts) covering all 1,025 Pokémon across 9 gens
- Local Dex tab dynamically named "{Region} Dex" in all 6 locale files via ngx-translate interpolation

## v1.2 Pokédex Visual Enhancement (Shipped: 2026-04-08)

**Phases completed:** 2 phases, 4 plans, 32 files, +2555 / -26 LOC

**Key accomplishments:**

- Shiny flag persistence: `PokedexEntry.shiny?: boolean` — cumulative, never reverts; `markWon` spread fix prevents silent data loss
- Mobile fullscreen fix: global `@media` override in `src/styles.css` — resolves ng-bootstrap portal rendering limitation
- Glow-pulse animation: `@keyframes glow-pulse` replaces static box-shadow on won cells — draws attention to champion Pokémon
- New `PokedexDetailModalComponent` (standalone) with official-artwork circle, zero-padded Pokédex number, localized name
- Alternate forms in detail modal: `PokemonFormsService.getFormIds()` approach avoids full PokemonItem dependency
- Shiny toggle in detail modal: only appears when `entry.shiny === true`; switches between regular and shiny official-artwork

## v1.3 Pokédex Data Integrity (Shipped: 2026-04-09)

**Phases completed:** 1 phase, 1 plan, 3 files, +67 / -1 LOC

**Key accomplishments:**

- Shiny flag now correctly persisted to Pokédex after shiny roulette resolves — `completePokemonCapture` assigns `currentContextPokemon` so `setShininess(true)` can update the entry
- Alt-form champion wins now register the base national dex entry — `championBattleResult` expands `wonIds` via `getBasePokemonId` flatMap to include base IDs (e.g. Alolan Raichu win also marks Raichu #26 as won)
- Bug fixes from previous session also shipped: fullscreen modal dark-theme fix, detail modal layout swap (number in header, name below art), `registerInPokedex` helper for all 5 capture call sites

---
