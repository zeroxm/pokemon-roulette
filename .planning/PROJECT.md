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

### Active

- [ ] Pokédex button alongside the existing `trainer.storage.access` PC button
- [ ] Pokédex modal with a Pokémon game-inspired UI, usable on desktop and mobile
- [ ] Local (generation) Dex view: shows all Pokémon in the current generation — unknown silhouette until assigned to team
- [ ] National Dex view: shows all 1,025 Pokémon — unknown silhouette until assigned to team in any run
- [ ] Two Pokédex states per Pokémon: **seen** (assigned to team, any outcome) and **won** (on team when Champion was defeated)
- [ ] Visual distinction between seen and won states (e.g. golden border/star for won)
- [ ] Per-view progress counter (e.g. "45 / 151 caught" for local, "67 / 1025" for national)
- [ ] Pokédex data persists across browser sessions via localStorage (same pattern as dark mode / settings)
- [ ] Pokédex updated in real time: Pokémon marked as seen when assigned by roulette, marked as won on Champion defeat

### Out of Scope

- Per-run Pokédex reset — Pokédex is global and cumulative; individual run tracking is a future iteration
- Pokédex entries (descriptions, types, stats) — this version only tracks caught/won state with sprite; full entries are a future iteration
- Pokédex completion reward or notification — nice-to-have deferred to a later version
- Filtering or searching the Pokédex — deferred to next iteration
- Shiny tracking in the Pokédex — deferred; shiny status is tracked per-run only for now

## Context

- **Architecture**: Angular 21 standalone components, RxJS BehaviorSubject services, no backend
- **Persistence**: localStorage pattern established by `DarkModeService` and `SettingsService` — Pokédex service should follow the same pattern
- **Pokémon assignment hook**: `completePokemonCapture(pokemon)` in `roulette-container.component.ts` calls `trainerService.addToTeam(pokemon)` — this is where seen-marking should happen
- **Win hook**: `championBattleResult(true)` in `roulette-container.component.ts` — this is where won-marking should happen using the current team from `TrainerService`
- **Pokémon data**: `pokemonByGeneration` (in `pokemon-by-generation.ts`) maps generation IDs to arrays of Pokémon IDs; `nationalDexPokemon` holds all 1,025 Pokémon; both are already available
- **Unknown sprite**: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png`
- **Sprite loading**: `pokemonService.getPokemonSprites(pokemonId)` returns Observable with `{ sprite: { front_default, front_shiny } }`
- **Button placement**: The PC button lives in `storage-pc.component.html` — the Pokédex button should sit next to it (or in the same parent `trainer-team` area)
- **Modal pattern**: `NgbModal` with `@ViewChild` template refs — established by `StoragePcComponent`
- **Current generation**: `generationService.getCurrentGeneration()` returns the active `GenerationItem` with `.id` (1–9)

## Constraints

- **Tech stack**: Angular 21 + Bootstrap 5 + ng-bootstrap — no new UI frameworks
- **Data**: Pokédex data must survive game resets (only `TrainerService.resetTeam()` should clear the in-run team, not the Pokédex)
- **Compatibility**: Must work on GitHub Pages (static deployment, no server-side logic)
- **Performance**: Pokédex grid can have 1,025 entries — sprites must be loaded lazily on demand, not all at once

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two Pokédex states: seen (assigned) vs. won (champion defeated) | Matches user expectation; mirrors real games' "seen/caught" distinction | — Pending |
| Local view scoped to currently selected generation | Simpler than per-run tracking; always accessible regardless of game state | — Pending |
| localStorage for persistence | Established pattern in the codebase; no backend required | — Pending |
| Lazy sprite loading in Pokédex grid | 1,025 API calls on modal open would be unacceptable; only load visible/interacted sprites | — Pending |
| Button placed alongside existing PC button in trainer-team area | User explicitly requested placement next to `trainer.storage.access` | — Pending |

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
*Last updated: 2026-04-03 after initialization*
