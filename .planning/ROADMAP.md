# Roadmap — Pokémon Roulette Type Matchup Milestone

## Goal

Make team type composition mechanically affect gym and elite four battle
outcomes. Type advantage shifts wheel odds and shows the player a modal
explaining why — turning team building into genuine strategy.

---

## Phases

- [x] **Phase 1: Type Data Foundation** — `type-matchups.json` + `GymLeader` interface extension
- [x] **Phase 2: Gym Leader Types** — Assign types to all gym leaders across all 9 generations
- [x] **Phase 3: Elite Four Types** — Assign types to all Elite Four members across all 9 generations
- [x] **Phase 4: TypeMatchupService** — Calculation logic: strong/weak counts + advantage label
- [x] **Phase 5: Gym Battle Integration** — Wheel weight adjustments + type advantage modal in gym battles
- [x] **Phase 6: Elite Four Battle Integration** — Same integration mirrored to elite four battle component

---

## Phase Details

### Phase 1: Type Data Foundation

**Goal:** The raw type effectiveness data is available at build time and the `GymLeader` interface is ready to hold per-leader type arrays — unblocking all downstream data entry and service work.

**Depends on:** Nothing

**Requirements:** DATA-01, DATA-02

**Success Criteria** (what must be TRUE):
  1. `type-matchups.json` exists at project root with all 18 attacking types, each with a `strongAgainst` and `weakAgainst` array of `PokemonType` values.
  2. `GymLeader` interface compiles with the optional `types?: PokemonType[]` field — existing data files with no `types` key produce no TypeScript errors.
  3. A developer can import `type-matchups.json` in a TypeScript file and read e.g. `typeMatchups['fire'].strongAgainst` with full type inference.

**Plans:** TBD

### Notes

- `type-matchups.json` lives at project root (`/home/andre/workspace/pokemon-roulette/type-matchups.json`). The file may already exist as a stub — verify before creating.
- `strongAgainst` = types the attacker hits for ×2. `weakAgainst` = types that deal ×2 to the attacker (defender perspective). This distinction is what SVC-01/02 will consume.
- `resolveJsonModule: true` should already be set in `tsconfig.app.json` (Angular CLI default) — verify before adding.
- Do NOT change `types` to required yet — existing data files have no types and will break the build. Keep `types?` optional throughout.

---

### Phase 2: Gym Leader Types

**Goal:** Every gym leader slot in every generation has a `types` array so the type matchup service can read opponent types during a gym battle.

**Depends on:** Phase 1

**Requirements:** GYM-01, GYM-02, GYM-03, GYM-04, GYM-05, GYM-06, GYM-07, GYM-08, GYM-09

**Success Criteria** (what must be TRUE):
  1. Every entry in `gym-leaders-by-generation.ts` for generations 1–9 has a `types` array with at least one `PokemonType` value.
  2. Multi-leader slots (Gen 5 round 0, Gen 5 round 7, Gen 7 round 2, Gen 7 round 4, Gen 8 round 3, Gen 8 round 5) have `types` arrays whose length matches the number of possible leaders in that slot (e.g. Cilan/Chili/Cress → 3 types).
  3. The file compiles with no TypeScript errors and no `any` casts introduced.
  4. A spot-check of 3 leaders per generation against canonical game data confirms correctness (e.g. Brock = rock, Morty = ghost, Fantina = ghost, Valerie = fairy).

**Plans:** TBD

### Notes

- Multi-slot resolution (Gen 5/7/8): the `types` array index must align with the `sprite` array index. `randomIndex` picks the same position from both arrays. After selection, the component sets `currentLeader.types = [types[randomIndex]]`.
- Gen 5 round 7 (Drayden/Iris): both are Dragon — `types: ['dragon', 'dragon']`. Redundant but explicit; resolves to `['dragon']` either way.
- Gen 7 follows USUM ordering as implemented in the data file: Ilima, Hala, Lana/Kiawe/Mallow, Olivia, Sophocles/Acerola, Nanu, Mina, Hapu.
- All type strings must be valid members of the `PokemonType` union — TypeScript will catch typos.

---

### Phase 3: Elite Four Types

**Goal:** Every Elite Four member slot in every generation has a `types` array, completing the data layer so the type matchup service can be fully exercised against both gym and Elite Four opponents.

**Depends on:** Phase 1

**Requirements:** E4-01, E4-02, E4-03, E4-04, E4-05, E4-06, E4-07, E4-08, E4-09

**Success Criteria** (what must be TRUE):
  1. Every entry in `elite-four-by-generation.ts` for generations 1–9 has a `types` array with at least one `PokemonType` value.
  2. Gen 8 multi-slots (index 0: Marnie/Hop/Bede, index 2: Bea/Allister) have `types` arrays matching slot count and correct type per leader.
  3. The file compiles with no TypeScript errors.
  4. Spot-check confirms correctness: e.g. Lance = dragon, Karen = dark, Drake = dragon, Kahili = flying, Hassel = dragon.

**Plans:** TBD

### Notes

- Elite Four reuses the `GymLeader` interface — no separate type changes needed.
- Gen 8 Elite Four represents the Champion Cup semi-finals. Multi-slot index 0 is `types: ['dark', 'normal', 'fairy']` (Marnie/Hop/Bede). Hop's team is mixed but `['normal']` is the documented default.
- Gen 9 index 2 is Larry's 2nd encounter as Flying specialist (not Normal as in gym round 4).
- Phases 2 and 3 are independent — they can be executed in either order or in parallel.

---

### Phase 4: TypeMatchupService

**Goal:** A single injectable service encapsulates all type advantage logic — team matchup counting and advantage label derivation — so battle components are kept free of type chart knowledge.

**Depends on:** Phase 1

**Requirements:** SVC-01, SVC-02, SVC-03

**Success Criteria** (what must be TRUE):
  1. `TypeMatchupService` is importable and injectable with no runtime errors in the Angular 21 app.
  2. `calcTeamMatchup(team, opponentTypes)` returns correct `{ strongCount, weakCount }` for a known scenario: a team of 6 Water-types vs a Fire-type opponent yields `strongCount: 6, weakCount: 0`.
  3. `getAdvantageLabel(strongCount, weakCount)` returns `'overwhelming'` for strong ≥ 3, `'advantage'` for strong 1–2, `'disadvantage'` for weak ≥ 1 (when not overridden by strong), and `null` for a neutral team.
  4. A team member with both a strong and a weak type against the opponent is counted in both `strongCount` and `weakCount`.
  5. A team member with `type1` only (null `type2`) is evaluated correctly without errors.

**Plans:** TBD

### Notes

- Service path: `src/app/services/type-matchup-service/type-matchup.service.ts`.
- Static JSON import: `import typeMatchups from '../../../../type-matchups.json'` (4 levels up to project root). Verify path if service directory changes.
- `isStrongAgainst(pokemonType, opponentType)`: check `typeMatchups[pokemonType].strongAgainst.includes(opponentType)`.
- `isWeakAgainst(pokemonType, opponentType)`: check `typeMatchups[opponentType].strongAgainst.includes(pokemonType)` (opponent type hits the Pokémon for SE).
- Advantage label priority: strong always wins over weak (a team that is both strongly advantaged and weakly positioned shows "advantage", not "disadvantage").
- Wheel entry counts to document in service (used by callers): overwhelming → +3 yes, advantage → +2 yes, disadvantage severity 2 (weak > 3) → +2 no, severity 1 (weak 1–2) → +1 no.

---

### Phase 5: Gym Battle Integration

**Goal:** When a gym battle starts, the player's wheel odds are silently adjusted for type matchup, and a modal tells them why — showing opponent type icons and the advantage label. Swapping via PC updates both in real time.

**Depends on:** Phase 2, Phase 4

**Requirements:** BATTLE-01, BATTLE-02, BATTLE-03, BATTLE-04

**Success Criteria** (what must be TRUE):
  1. Starting a gym battle with a type-advantaged team (strong ≥ 1) shows noticeably more green "win" segments on the wheel than the same team vs a neutral matchup.
  2. Starting a gym battle with a type-disadvantaged team shows more red "lose" segments than neutral.
  3. The type advantage modal appears automatically after the gym leader presentation modal — the player sees the leader, closes that modal, then sees the type result.
  4. The modal displays the gym leader's type icon(s) and one of the labels: "Overwhelming Advantage", "Advantage", or "Disadvantage". It does not appear for neutral matchups.
  5. Swapping a Pokémon via the PC during an active gym battle updates the wheel immediately and re-shows the type advantage modal reflecting the new team composition (when applicable).
  6. No console errors when entering a gym battle with a team where some Pokémon have no types set.

**Plans:** TBD

**UI hint**: yes

### Notes

- Hook location: inside `calcVictoryOdds()` in `gym-battle-roulette.component.ts`, after the power+item modifier loops and before `interleaveOdds()`. Guard: `if (!this.currentLeader?.types?.length) return`.
- Modal template: `<ng-template #typeAdvantageModal>` — reuse the PokeAPI type icon URL pattern from `pokedex-detail-modal`. Base URL: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/{id}.png` where id comes from `pokemonTypeDataByKey`.
- Modal queuing: call `this.modalQueueService.open(this.typeAdvantageModal, { centered: true, size: 'md' })` after the existing `gymLeaderPresentationModal` open — ModalQueueService guarantees serial display.
- PC swap re-show: in `teamSubscription` handler, after `calcVictoryOdds()`, check `this.currentGameState === 'gym-battle' && !!this.currentLeader` and advantage label non-null, then queue modal. Cache game state as `private currentGameState: string = ''` updated in the existing `gameSubscription` handler.
- BehaviorSubject race: `teamSubscription` fires at `ngOnInit` before `currentLeader` is set. The `currentLeader` guard handles this — type bonus is 0 on that first fire, corrected when `gameSubscription` calls `calcVictoryOdds()` after `getCurrentLeader()`.
- Wheel redraws automatically: `WheelComponent.ngOnChanges` watches `[items]="victoryOdds"` — reassigning the array is sufficient.

---

### Phase 6: Elite Four Battle Integration

**Goal:** Elite Four battles receive the same type matchup treatment as gym battles — wheel odds adjusted, modal displayed, PC swaps update both — completing the full feature scope.

**Depends on:** Phase 3, Phase 4, Phase 5

**Requirements:** E4BATTLE-01, E4BATTLE-02, E4BATTLE-03, E4BATTLE-04

**Success Criteria** (what must be TRUE):
  1. Starting an elite four battle with a type-advantaged team shows the correct extra win segments relative to a neutral baseline.
  2. The type advantage modal appears after the Elite Four member presentation modal (sequential, same ModalQueueService pattern as Phase 5).
  3. The modal displays the Elite Four member's type icon(s) and the correct label.
  4. PC swaps during an elite four battle update the wheel and re-show the modal, identical in behaviour to gym battles.
  5. Neutral matchups (no strong, no weak) show no modal — the wheel is unchanged from pre-type-matchup behaviour.
  6. Elite Four base odds (2 base no-slots vs gym's 1) are unaffected — the type bonus is strictly additive.

**Plans:** TBD

**UI hint**: yes

### Notes

- Target file: `elite-four-battle-roulette.component.ts`. Implementation mirrors Phase 5 exactly — same injection, same guard, same modal pattern, same PC-swap handler augmentation.
- Elite Four `calcVictoryOdds()` differs only in base `noOdds` count (starts with 2). The type bonus inserts after the power loop, same position as gym.
- Game state string to check in `teamSubscription` guard: confirm the exact state string used in `elite-four-battle-roulette.component.ts` (expected: `'elite-four-battle'` or similar).
- Gen 8 multi-slot (Marnie/Hop/Bede and Bea/Allister): the `currentLeader.types` will already be resolved to a single-element array by the time `calcVictoryOdds()` runs — same resolution pattern as gym multi-slots.
- After Phase 5, this phase is low-risk mechanical repetition. The primary risk is the exact game-state string — verify before implementing.

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Type Data Foundation | 2/2 | Complete | 2026-04-13 |
| 2. Gym Leader Types | 1/1 | Complete | 2026-04-13 |
| 3. Elite Four Types | 1/1 | Complete | 2026-04-13 |
| 4. TypeMatchupService | 1/1 | Complete | 2026-04-13 |
| 5. Gym Battle Integration | 1/1 | Complete | 2026-04-13 |
| 6. Elite Four Battle Integration | 1/1 | Complete | 2026-04-13 |

---

## Coverage

| Requirement | Phase |
|-------------|-------|
| DATA-01 | 1 |
| DATA-02 | 1 |
| GYM-01 | 2 |
| GYM-02 | 2 |
| GYM-03 | 2 |
| GYM-04 | 2 |
| GYM-05 | 2 |
| GYM-06 | 2 |
| GYM-07 | 2 |
| GYM-08 | 2 |
| GYM-09 | 2 |
| E4-01 | 3 |
| E4-02 | 3 |
| E4-03 | 3 |
| E4-04 | 3 |
| E4-05 | 3 |
| E4-06 | 3 |
| E4-07 | 3 |
| E4-08 | 3 |
| E4-09 | 3 |
| SVC-01 | 4 |
| SVC-02 | 4 |
| SVC-03 | 4 |
| BATTLE-01 | 5 |
| BATTLE-02 | 5 |
| BATTLE-03 | 5 |
| BATTLE-04 | 5 |
| E4BATTLE-01 | 6 |
| E4BATTLE-02 | 6 |
| E4BATTLE-03 | 6 |
| E4BATTLE-04 | 6 |

**Total: 31/31 requirements mapped. No orphans.**
