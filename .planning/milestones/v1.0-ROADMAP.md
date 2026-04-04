# Roadmap: Pokémon Roulette — Pokédex Feature

## Overview

This milestone adds a persistent Pokédex to the existing Pokémon Roulette game. The build follows a strict service-first order: the data layer is wired to game hooks first (so data accumulates during development), individual Pokémon cells are built next (so the lazy-loading strategy is validated before the modal exists), and the modal shell is assembled last (simple assembly once the hard pieces are proven). All three phases use established codebase patterns with no new dependencies.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Service & Game Hooks** - PokedexService with localStorage persistence wired to capture and Champion-defeat hooks
- [ ] **Phase 2: Entry Component & Visual States** - PokedexEntryComponent with lazy sprite loading and seen/won visual states
- [x] **Phase 3: Modal & Navigation** - Full Pokédex modal with Pokédex button, Local/National tabs, progress counters, and mobile layout (completed 2026-04-03)

## Phase Details

### Phase 1: Service & Game Hooks
**Goal**: Pokédex data is captured from game events and persists across browser sessions — verifiable before any UI exists
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. After catching a Pokémon, its ID appears in `localStorage["pokemon-roulette-pokedex"]` seen set (verifiable in DevTools → Application → Local Storage)
  2. After defeating the Champion, all current team Pokémon IDs appear in the won set in localStorage
  3. Closing and reopening the browser preserves all seen and won entries exactly
  4. Starting a new run does not modify or clear the Pokédex localStorage entry
  5. Catching the same Pokémon multiple times in one session results in exactly one PokeAPI sprite HTTP call (in-memory dedup via `Map<pokemonId, spriteUrl>`)
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Create PokedexService (localStorage persistence, markSeen, markWon, pokedex$ Observable) and wire 4 game hooks into roulette-container

### Phase 2: Entry Component & Visual States
**Goal**: Individual Pokémon cells render with correct visual states and sprites load only when scrolled into view
**Depends on**: Phase 1
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06
**Success Criteria** (what must be TRUE):
  1. Unseen Pokémon display a black silhouette (`filter: brightness(0)`) and `???` name; no PokeAPI HTTP call is made for them
  2. Seen Pokémon display their `front_default` sprite with the real Pokémon name revealed
  3. Won Pokémon display a gold ★ badge overlaid on their sprite
  4. Every cell shows the Pokédex number (`#001` format) regardless of seen/won state
  5. Sprites load incrementally as the user scrolls — Network tab shows PokeAPI calls only for cells that enter the viewport, not on grid render
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Build PokedexEntryComponent with 3-state flip card (unseen/seen/won), number badge, ngbTooltip, and gold won border

### Phase 3: Modal & Navigation
**Goal**: Players can open the Pokédex from the game UI and browse their collection by generation or nationally
**Depends on**: Phase 2
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. A "Pokédex" button is visible alongside the PC button in the trainer-team area; clicking it opens the Pokédex modal
  2. The modal has "Local Dex" and "National Dex" tabs; switching tabs changes the Pokémon grid to the correct set
  3. Each tab shows a live progress counter (e.g., "Seen: 45 / 151 | Won: 12 / 151") that updates in real time as Pokémon are caught
  4. On a mobile viewport (≤576px) the modal is full-screen (`modal-fullscreen-sm-down`)
  5. The modal respects dark mode — background, text, and cell styles match the active theme using the existing `darkMode$` pattern
**Plans**: 1 plan

Plans:
- [x] 03-01-PLAN.md — Build PokedexComponent (button + modal + tabs + progress counter) and wire into game UI

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Service & Game Hooks | 0/? | Not started | - |
| 2. Entry Component & Visual States | 0/? | Not started | - |
| 3. Modal & Navigation | 1/1 | Complete   | 2026-04-03 |
