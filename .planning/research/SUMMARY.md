# Project Research Summary

**Project:** Pokémon Roulette — Type Matchup Milestone
**Domain:** Angular game feature — probability-weighted wheel with Pokémon type advantage mechanics
**Researched:** 2025
**Confidence:** HIGH

## Executive Summary

This milestone adds type matchup awareness to the existing gym and Elite Four battle roulette wheels. The codebase is well-structured and the integration points are clearly defined: the wheel already works by pushing additional `WheelItem` entries (all `weight: 1`) into `yesOdds` / `noOdds` arrays, so the type bonus slots in cleanly without touching the wheel rendering layer at all. A new `TypeMatchupService` reads from the existing `type-matchups.json` (project root), computes a `{ yesBonus, noBonus }` count per team, and those counts drive extra entries inserted in `calcVictoryOdds()` — the one function both battle components already call reactively on every team change and every game-state transition.

The recommended approach is strictly additive: extend the `GymLeader` interface with `types: PokemonType[]`, populate all 9 generations of gym leader and Elite Four type data, create `TypeMatchupService`, hook the bonus into both `calcVictoryOdds()` functions, and queue a type advantage display inside the existing `gymLeaderPresentationModal` (or optionally a second modal via `ModalQueueService`'s built-in serial queue). The type icon URL pattern is already implemented in `PokedexDetailModalComponent` and can be reused directly.

The primary risks are a race condition (team subscription fires before `currentLeader` is set) and multi-leader slot data alignment (Gen 5/7/8 have 2-3 leaders per slot whose `types`, `sprite`, and `quotes` arrays must all be the same length and same index order). Both are straightforward to guard against with the patterns documented below.

---

## Key Findings

### Wheel Weight System (from BATTLE-INTEGRATION.md)

The `WheelItem.weight` field exists but is always `1` in all current battle components. The wheel is probability-proportional by **entry count**, not by weight value. To adjust win odds, push more items into `yesOdds` or `noOdds`. The wheel auto-redraws via `WheelComponent.ngOnChanges` watching `@Input() items` — assigning a new array to `this.victoryOdds` is sufficient.

**Integration point:** Inside `calcVictoryOdds()`, after the `trainerTeam.forEach` power loop and item modifiers, before the `interleaveOdds()` call.

```
calcVictoryOdds()
  → base yes slot
  → power slots (per Pokémon)
  → item modifier slots
  → ← TYPE MATCHUP BONUS SLOTS HERE
  → round-count no slots
  → base no slot(s)
  → interleaveOdds() → this.victoryOdds
```

### Existing Architecture (from BATTLE-INTEGRATION.md)

Both `GymBattleRouletteComponent` and `EliteFourBattleRouletteComponent` share identical initialization patterns:
- **Subscription 1 (team):** `trainerService.getTeamObservable()` — BehaviorSubject, fires immediately on subscribe, then on every team mutation including PC swaps
- **Subscription 2 (game state):** `gameStateService.currentState` — fires when state becomes `'gym-battle'` / `'elite-four'`; this is where `getCurrentLeader()` runs and where the presentation modal is queued

Both use the **manual subscription pattern** (`Subscription | null` + `?.unsubscribe()` in `ngOnDestroy`). All new subscriptions should follow this same pattern for consistency.

### ModalQueueService (from BATTLE-INTEGRATION.md)

Promise-chain serial queue. Each `open()` call appends to a `Promise<void>` chain and waits for the previous modal's `.result` to settle before opening the next. **No manual timing or `setTimeout` needed** — simply call `modalQueueService.open(this.typeAdvantageModal, ...)` immediately after the existing `gymLeaderPresentationModal` open call and it will appear second, automatically.

### GymLeader Interface Gap (from both files)

The current `GymLeader` interface has no `types` field:

```ts
// CURRENT — missing types
export interface GymLeader {
  name: string;
  sprite: string | string[];
  quotes: string[];
}

// REQUIRED
export interface GymLeader {
  name: string;
  sprite: string | string[];
  quotes: string[];
  types: PokemonType[];  // array to support multi-type leaders
}
```

`types` is an array (not singular) because multi-leader slots (Gen 5/7/8) have different types per leader variant. After the random leader is chosen via `randomIndex`, the component resolves to a single element: `types: [leaderTypes[randomIndex]]`.

### Type Data (from TYPE-MATCHUPS.md)

The full 18×18 effectiveness chart is already available in `type-matchups.json` at the project root. Structure is `chart[attacker][defender]` = `0 | 0.5 | 1 | 2`. All 9 generations of gym leader and Elite Four types are fully documented and ready to copy into data files.

**All gym leader types (quick reference):**
```
Gen 1: [rock], [water], [electric], [grass], [poison], [psychic], [fire], [ground]
Gen 2: [flying], [bug], [normal], [ghost], [fighting], [steel], [ice], [dragon]
Gen 3: [rock], [fighting], [electric], [fire], [normal], [flying], [psychic], [water]
Gen 4: [rock], [grass], [fighting], [water], [ghost], [steel], [ice], [electric]
Gen 5: [grass,fire,water], [normal], [bug], [electric], [ground], [flying], [ice], [dragon,dragon]
Gen 6: [bug], [rock], [fighting], [grass], [electric], [fairy], [psychic], [ice]
Gen 7: [normal], [fighting], [water,fire,grass], [rock], [electric,ghost], [dark], [fairy], [ground]
Gen 8: [grass], [water], [fire], [fighting,ghost], [fairy], [rock,ice], [dark], [dragon]
Gen 9: [bug], [grass], [electric], [water], [normal], [ghost], [psychic], [ice]
```

**All Elite Four types (quick reference):**
```
Gen 1: [ice], [fighting], [ghost], [dragon]
Gen 2: [psychic], [poison], [fighting], [dark]
Gen 3: [dark], [ghost], [ice], [dragon]
Gen 4: [bug], [ground], [fire], [psychic]
Gen 5: [ghost], [fighting], [dark], [psychic]
Gen 6: [fire], [water], [steel], [dragon]
Gen 7: [steel], [rock], [ghost], [flying]
Gen 8: [dark/normal/fairy], [water], [fighting/ghost], [dragon]  ← multi-slot
Gen 9: [ground], [steel], [flying], [dragon]
```

### TypeMatchupService Design (from TYPE-MATCHUPS.md)

Designed and ready to implement. Core API:

```ts
getEffectiveness(attacker: PokemonType, defender: PokemonType): 0 | 0.5 | 1 | 2
getBestEffectiveness(pokemonTypes: PokemonType[], leaderTypes: PokemonType[]): 0 | 0.5 | 1 | 2
calcTypeBonus(type1s, type2s, leaderTypes): { yesBonus: number; noBonus: number }
```

**Bonus formula per Pokémon:**
- Super effective (×2): +2 yes slots
- Neutral (×1): +0
- Not very effective (×0.5): +1 no slot
- Immune (×0): +2 no slots

Import `type-matchups.json` via static TypeScript import (`resolveJsonModule: true` is already set by Angular CLI). Alternatively, move to `src/assets/` and use `HttpClient` — but static import is zero-latency (bundled).

### Type Icon Reuse (from both files)

`PokedexDetailModalComponent` already has the icon URL pattern:
```ts
`https://raw.githubusercontent.com/.../sprites/types/generation-viii/brilliant-diamond-shining-pearl/${typeData.id}.png`
```

`pokemonTypeDataByKey` (O(1) type→id lookup) is already exported from `src/app/interfaces/pokemon-type.ts`. Extract the URL base to a shared constant; do not duplicate it.

---

## Critical Pitfalls

1. **BehaviorSubject race condition — `currentLeader` not set on first team emission**
   - The team observable fires immediately on subscribe (BehaviorSubject semantics), which is *before* `gameStateService.currentState` emits `'gym-battle'` and calls `getCurrentLeader()`.
   - **Prevention:** Guard every read of `currentLeader.types` in `calcVictoryOdds()` with `if (!this.currentLeader?.types?.length) return 0` (or equivalent). The second call to `calcVictoryOdds()` from the game-state subscription — which runs *after* `getCurrentLeader()` — will have the correct leader and will produce the right bonus.

2. **Multi-leader array length misalignment (Gen 5, 7, 8)**
   - When a gym slot has 2-3 possible leaders, `sprite` is already a `string[]`. The new `types` array must be the **same length, same index order**.
   - Gen 5 round 0: `sprite[0]` = Cilan → `types[0]` = `'grass'`; `sprite[1]` = Chili → `types[1]` = `'fire'`; `sprite[2]` = Cress → `types[2]` = `'water'`
   - After `randomIndex` is selected in `getCurrentLeader()`, set `types: [leaderTypes[randomIndex]]` on the resolved `currentLeader`.
   - **Prevention:** When adding type data to the data files, always count the existing `sprite` array length and ensure `types` matches exactly.

3. **Elite Four uses `currentElite` not `currentLeader`**
   - The two components are structurally identical but use different variable names. Type bonus code must be duplicated (or extracted to a shared base class/mixin), not shared directly.
   - **Prevention:** Treat both components as independent; apply the same changes to both.

4. **`type-matchups.json` import path is fragile if service moves**
   - Static import path `../../../../type-matchups.json` is relative to the service file location. If the service is moved, the path breaks silently (TypeScript will catch it, but it's easy to miscopy).
   - **Prevention:** Consider placing the file at `src/assets/type-matchups.json` and referencing via `HttpClient`, or add a path alias. The file already exists at project root — either move it or keep the import careful.

5. **Type icon URL duplication**
   - `PokedexDetailModalComponent` has the URL hardcoded privately. Copying it into a second component creates a maintenance hazard.
   - **Prevention:** Extract to `src/app/utils/type-icon-utils.ts` as a shared exported constant + function before using it in battle components.

---

## Implications for Roadmap

### Phase 1: Data Layer — Interface Extension + Type Data Population
**Rationale:** Everything downstream depends on `GymLeader.types` and the type data files. Zero implementation risk; pure data entry. Must be done first so the service and components have something to read.
**Delivers:** Extended `GymLeader` interface, all 9 gens of gym leader types, all 9 gens of Elite Four types populated in their respective data files.
**Files touched:**
- `src/app/interfaces/gym-leader.ts` — add `types: PokemonType[]`
- `src/app/data/gym-leaders-by-generation.ts` — add `types` to all 72 entries (with multi-leader arrays for Gen 5/7/8)
- `src/app/data/elite-four-by-generation.ts` — add `types` to all 36 entries (with multi-slot handling for Gen 8)
**Pitfall to avoid:** Multi-leader array alignment (Pitfall #2)

### Phase 2: TypeMatchupService + Shared Utilities
**Rationale:** Isolated service with no component dependencies — can be built and unit-tested independently. Also the right time to extract the type icon utility to avoid duplication.
**Delivers:** `TypeMatchupService` with `calcTypeBonus()`, shared `type-icon-utils.ts` constant and helper, JSON import confirmed working.
**Files touched:**
- `src/app/services/type-matchup-service/type-matchup.service.ts` — create
- `src/app/utils/type-icon-utils.ts` — create (extract from PokedexDetailModal)
- `src/app/pokedex/pokedex-detail-modal/pokedex-detail-modal.component.ts` — refactor to use shared util
**Pitfall to avoid:** JSON import path fragility (Pitfall #4)

### Phase 3: Wheel Integration — Both Battle Components
**Rationale:** With data and service in place, the component integration is mechanical. Apply identically to both gym and elite four components. The guard for the BehaviorSubject race condition must be in place from the start.
**Delivers:** Type matchup bonus slots appear in the wheel for both gym and Elite Four battles. Wheel updates automatically on PC team swaps (no additional subscription needed — the existing team subscription already calls `calcVictoryOdds()`).
**Files touched:**
- `gym-battle-roulette.component.ts` — inject service, add type bonus in `calcVictoryOdds()`, resolve multi-leader types in `getCurrentLeader()`
- `elite-four-battle-roulette.component.ts` — same (using `currentElite`)
**Pitfall to avoid:** BehaviorSubject race condition (Pitfall #1), Elite Four naming (Pitfall #3)

### Phase 4: Type Advantage UI — Modal Display
**Rationale:** Purely additive UI layer on top of a working mechanic. Lets the team verify wheel odds are correct before adding UI complexity. The `ModalQueueService` serial queue means no timing logic is needed.
**Delivers:** Type advantage label and type icons shown in the gym leader presentation modal (or queued as a second modal). Works for both gym and Elite Four. Updates on PC swap if in battle.
**Files touched:**
- `gym-battle-roulette.component.html` — add type icons + advantage summary to `gymLeaderPresentationModal` template
- `elite-four-battle-roulette.component.html` — same
- Both `.component.ts` files — add `getTypeAdvantageLabel()` helper, optional second modal queue call
**Pitfall to avoid:** Type icon URL duplication (Pitfall #5)

### Phase Ordering Rationale

- Data → Service → Component Logic → UI follows strict dependency order; no phase can start before the prior one's interfaces are stable.
- Phases 1 and 2 can be parallelized if multiple developers are available (they don't share files).
- Phase 3 is the core deliverable; Phase 4 is polish. If time-boxed, Phase 3 alone is a complete and shippable feature.
- The existing `ModalQueueService` serial queue eliminates the most common async UI pitfall (overlapping modals), so Phase 4 carries very low implementation risk.

### Research Flags

**No additional research phases needed.** Both research files were generated from direct source code inspection (HIGH confidence). All integration points are identified and code patterns are copy-paste ready.

Standard patterns (no further research needed):
- **Phase 1:** Pure data entry against known interface schema
- **Phase 2:** Standard Angular injectable service with static JSON import
- **Phase 3:** Follows existing `calcVictoryOdds()` pattern exactly
- **Phase 4:** Follows existing `ModalQueueService.open()` pattern exactly

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Wheel weight system | HIGH | Direct source read of `WheelComponent`, `gym-battle-roulette`, `elite-four-battle-roulette` |
| ModalQueueService | HIGH | Direct source read of `modal-queue.service.ts` |
| Team observable / PC swap | HIGH | Direct source read of `trainer.service.ts` and `storage-pc.component.ts` |
| Type chart data | HIGH | Canonical Gen VI+ 18×18 chart; already encoded in `type-matchups.json` |
| Gym leader types (Gen 1-9) | HIGH | Verified against canonical game data; multi-leader slots cross-referenced with existing sprite arrays |
| Elite Four types (Gen 1-9) | HIGH | Same — Gen 8 Champion Cup multi-slot noted and documented |
| Multi-leader resolution pattern | HIGH | Pattern read directly from existing component `getCurrentLeader()` implementation |
| Balance / bonus values | MEDIUM | Proposed formula (×2 → +2, ×0.5 → +1 no, ×0 → +2 no) is a reasonable starting point; final values should be playtested |

**Overall confidence:** HIGH

### Gaps to Address

- **Hop's type (Gen 8 Elite Four index 0):** Hop uses a mixed team. `['normal']` (Dubwool) is used as the working assumption. Verify against the actual team in `elite-four-by-generation.ts` — if Hop's team is already defined there, use whichever type is most represented.
- **Balance tuning:** The bonus formula is a design decision, not a research finding. The math checks out (documented in TYPE-MATCHUPS.md §7.6 with example calculations), but the exact numbers should be validated through play.
- **`resolveJsonModule` in tsconfig.app.json:** Research states Angular CLI sets this by default. Confirm it's actually present before writing the import in `TypeMatchupService`.

---

## Sources

### Primary (HIGH confidence — direct source file reads)

- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
- `src/app/wheel/wheel.component.ts`
- `src/app/interfaces/wheel-item.ts`
- `src/app/interfaces/pokemon-item.ts`
- `src/app/interfaces/pokemon-type.ts`
- `src/app/interfaces/gym-leader.ts`
- `src/app/services/modal-queue-service/modal-queue.service.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/trainer-team/storage-pc/storage-pc.component.ts`
- `src/app/pokedex/pokedex-detail-modal/pokedex-detail-modal.component.ts`
- `src/utils/odd-utils.ts`
- `type-matchups.json` (project root)

### Secondary (HIGH confidence — canonical game data)

- Pokémon type effectiveness chart (Gen VI+) — canonical 18×18 data cross-referenced with `type-matchups.json`
- Gym leader and Elite Four type assignments — all 9 generations, verified against canonical game knowledge

---
*Research completed: 2025*
*Ready for roadmap: yes*
