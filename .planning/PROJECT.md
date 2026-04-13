# Pokémon Roulette

## Current Milestone: v1.1 — Inline Type Matchup Display

**Goal:** Replace the type advantage modal with a persistent inline strip between the battle title and wheel, fixing the double-modal bug in the process.

**Target features:**
- Remove `typeAdvantageModal` entirely from both battle roulette components
- Add inline matchup strip: `[leader type icon] → [advantage label] → [team type icons]`
- Null result (no advantage): show leader type icon only
- Advantage: leader icon + label + team Pokémon types that are SE against the leader
- Disadvantage: leader icon + label + team Pokémon types the leader is SE against
- Live update on PC team swap
- Both gym and Elite Four battle roulettes

---

## Previous State — v1.0 SHIPPED (2026-04-13)

Type matchup integration: wheel odds shift based on type advantage, type advantage modal shown at battle start, PC-swap recalculation. TypeMatchupService + type data for all 9 gens shipped.

---

<details>
<summary>v1.0 Milestone Context (archived)</summary>

## What This Is (v1.0)

Pokémon Roulette is a browser-based Angular game where players build a team through a series of roulette spins simulating a full Pokémon adventure. Types have been added cosmetically; this milestone makes them mechanically meaningful by calculating type advantages against Gym Leaders and Elite Four opponents and adjusting battle roulette wheel weights accordingly.

## Core Value

The player's team composition should visibly influence battle outcomes — type advantage creates stakes, strategy, and narrative drama that pure luck cannot.

## Requirements

### Validated

- ✓ Pokémon types exist on `PokemonItem` (`type1`, `type2`) and are displayed cosmetically
- ✓ `GymLeader` interface and data files exist for all generations
- ✓ Elite Four data files exist (reusing `GymLeader` interface)
- ✓ Modal queue service exists for informational messages
- ✓ Battle wheel weights are already driven by `WheelItem.weight`

### Active

- [ ] `type-matchups.json` at project root — full 18×18 effectiveness table, TypeScript-typed via `PokemonType`
- [ ] `GymLeader` interface extended with `types: PokemonType[]`
- [ ] All gym leaders and elite four members assigned types across all generations
- [ ] `TypeMatchupService` calculates team advantage/disadvantage against an opponent's types
- [ ] Gym and Elite Four battle roulettes apply weight adjustments (+3/+2 win, +2/+1 lose)
- [ ] Modal informs player of result ("Overwhelming Advantage", "Advantage", "Disadvantage") with type icons at battle start
- [ ] Recalculates and re-shows modal immediately when team changes via PC during an active battle

### Out of Scope

- Champion battle type matchups — user explicitly excluded
- Rival battle type matchups — only gym/elite four battles
- Individual move-level type calculation — team-level only
- Net advantage calculation (attack vs defence) — any SE attack counts as "strong"

## Context

- Angular 21, standalone components, RxJS
- `PokemonType` union type with 18 values already in `src/app/interfaces/pokemon-type.ts`
- `PokemonItem` has optional `type1?: PokemonType` and `type2?: PokemonType | null`
- `GymLeader` interface currently only has `name`, `sprite`, `quotes` — no types yet
- Elite Four data reuses the `GymLeader` interface and type
- Type icons used in pokedex-detail-modal should be reused for the modal display
- `ModalQueueService` is the established pattern for informational overlays
- Team changes during battle go through `TrainerService.getTeamObservable()`

## Constraints

- **Tech**: Angular 21, no new runtime dependencies
- **Data**: `type-matchups.json` must be typed using the existing `PokemonType` union
- **Scope**: Gym battles and Elite Four only (not Champion, not Rival)
- **Logic**: "Strong" = at least one of the Pokémon's types is SE against at least one opponent type; "Weak" = at least one opponent type is SE against at least one of the Pokémon's types

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `type-matchups.json` at project root | User requirement; becomes a typed TS reference via `PokemonType` | — Pending |
| Any SE match counts as "strong" | User confirmed — simple and clear | — Pending |
| Recalculate on team change immediately | User wants live feedback during battle | — Pending |
| Skip Champion/Rival | User explicitly excluded for now | — Pending |

---
*Last updated: 2026-04-13 — initial PROJECT.md from user interview*

</details>
