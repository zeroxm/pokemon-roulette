# Pokémon Roulette — Pokédex Feature

## What This Is

Pokémon Roulette is a browser-based randomizer game where players spin a roulette wheel to assemble a Pokémon team and battle through a generation's gym leaders, Elite Four, and Champion. The current milestone adds a persistent Pokédex — a global tracker that records every Pokémon assigned to the player's team across all runs, with a special distinction for Pokémon that were on the team when the Champion was defeated.

## Core Value

Players can see which Pokémon they've encountered and won with over time, giving the game lasting replayability beyond individual runs.

## Requirements

### Validated

- ✓ Generation-based roulette — players spin through gym leaders, Elite Four, and Champion — existing
- ✓ Pokémon team management (team + PC storage, drag-and-drop) — existing
- ✓ Persistent settings (dark mode, language, audio) via localStorage — existing
- ✓ Multi-language support (EN, ES, FR, DE, IT, PT) via ngx-translate — existing
- ✓ PokeAPI sprite loading for Pokémon artwork — existing
- ✓ 9 generations supported (Kanto through Paldea) — existing
- ✓ Pokédex button alongside the existing PC button — v1.0
- ✓ Pokédex modal with Local Dex / National Dex tabs — v1.0
- ✓ Local Dex view: shows all Pokémon in current generation — v1.0
- ✓ National Dex view: shows all 1,025 Pokémon — v1.0
- ✓ Two states per Pokémon: seen (assigned to team) and won (on team at Champion defeat) — v1.0
- ✓ Visual distinction: gold border for won Pokémon, 3D flip card reveal for seen — v1.0
- ✓ Per-view progress counter (e.g. "45 / 151") — v1.0
- ✓ Pokédex persists across browser sessions via localStorage — v1.0
- ✓ Real-time updates: seen on team assignment, won on Champion defeat — v1.0

### Active

_(empty — all v1.0 requirements delivered)_

### Out of Scope

- Per-run Pokédex reset — Pokédex is global and cumulative; individual run tracking is a future iteration
- Pokédex entries (descriptions, types, stats) — this version only tracks caught/won state with sprite; full entries are a future iteration
- Pokédex completion reward or notification — nice-to-have deferred to a later version
- Filtering or searching the Pokédex — deferred to next iteration
- Shiny tracking in the Pokédex — deferred; shiny status is tracked per-run only for now

## Context

- **Shipped:** v1.0 Pokédex Feature (2026-04-04) — 3 phases, 3 plans, 141 passing tests
- **Architecture**: Angular 21 standalone components, RxJS BehaviorSubject services, no backend
- **New files added:** `PokedexService`, `PokedexEntryComponent`, `PokedexComponent` (4 files each)
- **localStorage key:** `'pokemon-roulette-pokedex'` — schema `{ caught: Record<string, { won: boolean, sprite: string|null }> }`
- **Sprite source:** `front_default` from PokeAPI (not `official-artwork`) — URLs are deterministic and cached
- **Known caveats:** `ng test --include` filter is broken in this project's Karma/webpack setup — always use full suite

## Constraints

- **Tech stack**: Angular 21 + Bootstrap 5 + ng-bootstrap — no new UI frameworks
- **Data**: Pokédex data must survive game resets (only `TrainerService.resetTeam()` should clear the in-run team, not the Pokédex)
- **Compatibility**: Must work on GitHub Pages (static deployment, no server-side logic)
- **Performance**: Pokédex grid can have 1,025 entries — sprites must be loaded lazily on demand, not all at once

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two Pokédex states: seen (assigned) vs. won (champion defeated) | Matches user expectation; mirrors real games' "seen/caught" distinction | ✓ Good — intuitive for players |
| Local view scoped to currently selected generation | Simpler than per-run tracking; always accessible regardless of game state | ✓ Good — no edge cases |
| localStorage for persistence | Established pattern in the codebase; no backend required | ✓ Good — consistent with dark mode / settings |
| Lazy sprite loading in Pokédex grid | 1,025 API calls on modal open would be unacceptable; only load visible sprites | ✓ Good — `loading="lazy"` on img elements |
| Button placed alongside existing PC button in trainer-team area | User explicitly requested placement next to `trainer.storage.access` | ✓ Good — `d-flex gap-2` layout |
| `front_default` sprites (not `official-artwork`) | Smaller files, faster load for 1,025-entry grid | ✓ Good — deterministic GitHub CDN URLs |
| Deterministic sprite URLs (no HTTP on write) | Computed from pokemonId — no PokeAPI call at markSeen time | ✓ Good — zero latency on capture |
| String keys in `caught` Record | JSON serialization trivial; O(1) lookup | ✓ Good — consistent across service and UI |
| PokedexService decoupled from TrainerService | Callers pass pokemonId directly — no coupling between data and team management | ✓ Good — testable in isolation |
| No `clearPokedex()` method | Pokédex must survive game resets by design | ✓ Good — prevents accidental data loss |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-04 after v1.0 milestone*
