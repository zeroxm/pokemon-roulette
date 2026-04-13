# Requirements — Pokémon Roulette Type Matchup Milestone

## Overview

Make Pokémon types mechanically meaningful in gym and elite four battles.
The player's team composition influences wheel odds — type advantage creates
stakes, strategy, and narrative drama that pure luck cannot.

---

## Categories

| Category | Description |
|----------|-------------|
| DATA     | Type data files and interface extensions |
| GYM      | Gym leader type assignments per generation |
| E4       | Elite Four type assignments per generation |
| SVC      | TypeMatchupService calculation logic |
| BATTLE   | Gym battle roulette integration |
| E4BATTLE | Elite Four battle roulette integration |

---

## V1 Requirements (Active Scope)

### DATA — Data Foundation

**DATA-01** — `type-matchups.json` at project root  
Full 18×18 type effectiveness table. Each key is an attacking `PokemonType`.
Each value has `strongAgainst: PokemonType[]` (×2 targets) and
`weakAgainst: PokemonType[]` (×0 and ×0.5 targets — types the attacker
cannot hit effectively). All 18 types must be present.

**DATA-02** — `GymLeader` interface extended with `types?: PokemonType[]`  
The existing `GymLeader` interface in `src/app/interfaces/gym-leader.ts`
gains an optional `types` field. It is an array to accommodate multi-leader
slots (Gen 5/7/8) where each index corresponds to one possible leader.
After random leader selection the component resolves to a single-element
array for that battle.

---

### GYM — Gym Leader Type Assignments

**GYM-01** — Gen 1 (Kanto) gym leaders assigned types  
Brock `['rock']`, Misty `['water']`, Lt. Surge `['electric']`, Erika `['grass']`,
Koga `['poison']`, Sabrina `['psychic']`, Blaine `['fire']`, Giovanni `['ground']`.

**GYM-02** — Gen 2 (Johto) gym leaders assigned types  
Falkner `['flying']`, Bugsy `['bug']`, Whitney `['normal']`, Morty `['ghost']`,
Chuck `['fighting']`, Jasmine `['steel']`, Pryce `['ice']`, Clair `['dragon']`.

**GYM-03** — Gen 3 (Hoenn) gym leaders assigned types  
Roxanne `['rock']`, Brawly `['fighting']`, Wattson `['electric']`,
Flannery `['fire']`, Norman `['normal']`, Winona `['flying']`,
Liza & Tate `['psychic']`, Wallace `['water']`.

**GYM-04** — Gen 4 (Sinnoh) gym leaders assigned types  
Roark `['rock']`, Gardenia `['grass']`, Maylene `['fighting']`,
Crasher Wake `['water']`, Fantina `['ghost']`, Byron `['steel']`,
Candice `['ice']`, Volkner `['electric']`.

**GYM-05** — Gen 5 (Unova) gym leaders assigned types (multi-slot)  
Round 0 multi-slot: `types: ['grass', 'fire', 'water']` (Cilan/Chili/Cress —
index 0/1/2 respectively). Round 7 multi-slot: `types: ['dragon', 'dragon']`
(Drayden/Iris). Remaining: Lenora `['normal']`, Burgh `['bug']`,
Elesa `['electric']`, Clay `['ground']`, Skyla `['flying']`, Brycen `['ice']`.
After `randomIndex` selection the component builds `currentLeader.types`
as a single-element array: `[types[randomIndex]]`.

**GYM-06** — Gen 6 (Kalos) gym leaders assigned types  
Viola `['bug']`, Grant `['rock']`, Korrina `['fighting']`, Ramos `['grass']`,
Clemont `['electric']`, Valerie `['fairy']`, Olympia `['psychic']`,
Wulfric `['ice']`.

**GYM-07** — Gen 7 (Alola) trial captains assigned types (multi-slot)  
Ilima `['normal']`, Hala `['fighting']`,
Round 2 multi-slot: `types: ['water', 'fire', 'grass']` (Lana/Kiawe/Mallow),
Olivia `['rock']`,
Round 4 multi-slot: `types: ['electric', 'ghost']` (Sophocles/Acerola),
Nanu `['dark']`, Mina `['fairy']`, Hapu `['ground']`.

**GYM-08** — Gen 8 (Galar) gym leaders assigned types (multi-slot)  
Milo `['grass']`, Nessa `['water']`, Kabu `['fire']`,
Round 3 multi-slot: `types: ['fighting', 'ghost']` (Bea/Allister),
Opal `['fairy']`,
Round 5 multi-slot: `types: ['rock', 'ice']` (Gordie/Melony),
Piers `['dark']`, Raihan `['dragon']`.

**GYM-09** — Gen 9 (Paldea) gym leaders assigned types  
Katy `['bug']`, Brassius `['grass']`, Iono `['electric']`, Kofu `['water']`,
Larry `['normal']`, Ryme `['ghost']`, Tulip `['psychic']`, Grusha `['ice']`.

---

### E4 — Elite Four Type Assignments

**E4-01** — Gen 1 (Kanto) Elite Four assigned types  
Lorelei `['ice']`, Bruno `['fighting']`, Agatha `['ghost']`, Lance `['dragon']`.

**E4-02** — Gen 2 (Johto) Elite Four assigned types  
Will `['psychic']`, Koga `['poison']`, Bruno `['fighting']`, Karen `['dark']`.

**E4-03** — Gen 3 (Hoenn) Elite Four assigned types  
Sidney `['dark']`, Phoebe `['ghost']`, Glacia `['ice']`, Drake `['dragon']`.

**E4-04** — Gen 4 (Sinnoh) Elite Four assigned types  
Aaron `['bug']`, Bertha `['ground']`, Flint `['fire']`, Lucian `['psychic']`.

**E4-05** — Gen 5 (Unova) Elite Four assigned types  
Shauntal `['ghost']`, Marshal `['fighting']`, Grimsley `['dark']`, Caitlin `['psychic']`.

**E4-06** — Gen 6 (Kalos) Elite Four assigned types  
Malva `['fire']`, Siebold `['water']`, Wikstrom `['steel']`, Drasna `['dragon']`.

**E4-07** — Gen 7 (Alola) Elite Four assigned types  
Molayne `['steel']`, Olivia `['rock']`, Acerola `['ghost']`, Kahili `['flying']`.

**E4-08** — Gen 8 (Galar) Champion Cup semi-finals assigned types (multi-slot)  
Index 0 multi-slot: `types: ['dark', 'normal', 'fairy']` (Marnie/Hop/Bede),
Nessa `['water']`,
Index 2 multi-slot: `types: ['fighting', 'ghost']` (Bea/Allister),
Raihan `['dragon']`. Multi-slot resolution follows the same `randomIndex`
pattern as gym leaders.

**E4-09** — Gen 9 (Paldea) Elite Four assigned types  
Rika `['ground']`, Poppy `['steel']`, Larry (2nd) `['flying']`, Hassel `['dragon']`.

---

### SVC — TypeMatchupService

**SVC-01** — TypeMatchupService created at `src/app/services/type-matchup-service/`  
Injectable service, `providedIn: 'root'`. Statically imports
`type-matchups.json` (bundled at build time, no HTTP fetch). Exposes:
- `isStrongAgainst(pokemonType: PokemonType, opponentType: PokemonType): boolean`
  — returns true if pokemonType appears in opponentType's `strongAgainst`
  (i.e. pokemonType is SE against opponentType).
- `isWeakAgainst(pokemonType: PokemonType, opponentType: PokemonType): boolean`
  — returns true if opponentType is SE against pokemonType.

**SVC-02** — `calcTeamMatchup()` method on TypeMatchupService  
Signature: `calcTeamMatchup(team: PokemonItem[], opponentTypes: PokemonType[]): { strongCount: number; weakCount: number }`  
Rules:
- A team member is **strong** if ANY of its types (type1, type2) is SE against
  ANY of the opponent's types.
- A team member is **weak** if ANY of the opponent's types is SE against ANY
  of the team member's types.
- A member can be both strong and weak simultaneously (counts in both).
- Returns raw counts across the full team.

**SVC-03** — `getAdvantageLabel()` method on TypeMatchupService  
Signature: `getAdvantageLabel(strongCount: number, weakCount: number): 'overwhelming' | 'advantage' | 'disadvantage' | null`  
Rules (applied in order, strong takes precedence):
- strong ≥ 3 → `'overwhelming'` (Overwhelming Advantage; +3 yes entries)
- strong 1–2 → `'advantage'` (Advantage; +2 yes entries)
- weak > 3 → `'disadvantage'` with severity 2 (+2 no entries)
- weak 1–2 → `'disadvantage'` with severity 1 (+1 no entry)
- otherwise → `null` (no change)

Note: The service returns the label only; the callers (`calcVictoryOdds`)
map label → entry count using the values above.

---

### BATTLE — Gym Battle Roulette Integration

**BATTLE-01** — Gym battle `calcVictoryOdds()` applies type wheel weight adjustments  
Inside `gym-battle-roulette.component.ts`, after the existing power/item
modifier loop and before `interleaveOdds()`, call `TypeMatchupService.calcTeamMatchup()`.
If `currentLeader?.types?.length` is falsy, skip (guard against early
subscription fire). Push extra `WheelItem` entries (weight: 1) into
`yesOdds` or `noOdds` per the advantage rules in SVC-03.

**BATTLE-02** — Gym battle shows type advantage modal at battle start  
A `<ng-template #typeAdvantageModal>` in the gym battle template displays:
- The opponent's type icon(s) (reusing PokeAPI sprite URL pattern)
- The result label ("Overwhelming Advantage", "Advantage", or "Disadvantage")
- Team strong/weak counts
Queued via `ModalQueueService.open()` immediately after the existing
`gymLeaderPresentationModal` open call, inside the `state === 'gym-battle'`
block. Only queued when advantage label is non-null.

**BATTLE-03** — Gym battle recalculates wheel weights on PC team changes  
The existing `teamSubscription` already calls `calcVictoryOdds()` on every
team change. With BATTLE-01 in place, type bonus recalculation is automatic.
No additional subscription needed.

**BATTLE-04** — Gym battle re-shows type advantage modal on PC team change  
In the `teamSubscription` handler, after `calcVictoryOdds()`, if the game
is in `'gym-battle'` state and `currentLeader` is set, and the advantage
label is non-null, queue the type advantage modal again via `ModalQueueService`.
Cache the current game state in the component using the existing
`gameSubscription` pattern (store as `private currentState: string`).

---

### E4BATTLE — Elite Four Battle Roulette Integration

**E4BATTLE-01** — Elite Four battle `calcVictoryOdds()` applies type wheel weight adjustments  
Mirror of BATTLE-01 for `elite-four-battle-roulette.component.ts`. Same
guard (`currentLeader?.types?.length`), same entry-push logic, same
precedence rules. Elite Four base `noOdds` starts with 2 slots vs gym's 1;
the type bonus is additive on top.

**E4BATTLE-02** — Elite Four battle shows type advantage modal at battle start  
Mirror of BATTLE-02 for the Elite Four component. Modal queued after the
existing Elite Four member presentation modal, inside the
`state === 'elite-four-battle'` block (or equivalent state string).

**E4BATTLE-03** — Elite Four battle recalculates wheel weights on PC team changes  
Mirror of BATTLE-03. Automatic via existing `teamSubscription` once
E4BATTLE-01 is implemented.

**E4BATTLE-04** — Elite Four battle re-shows type advantage modal on PC team change  
Mirror of BATTLE-04 for the Elite Four component. Cache game state,
conditional modal re-queue.

---

## Out of Scope (V2 or Explicit Exclusions)

| Item | Reason |
|------|--------|
| Champion battle type matchups | User explicitly excluded |
| Rival battle type matchups | User explicitly excluded |
| Individual move-level type calculation | Team-level only by design |
| Net advantage (attack vs defence combined) | Any SE attack counts as "strong" |
| `HttpClient` fetch for type-matchups.json | Static import preferred (zero-latency) |
| `TypeIconPipe` extraction to shared utility | Can follow as standalone refactor |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| GYM-01  | Phase 2 | Pending |
| GYM-02  | Phase 2 | Pending |
| GYM-03  | Phase 2 | Pending |
| GYM-04  | Phase 2 | Pending |
| GYM-05  | Phase 2 | Pending |
| GYM-06  | Phase 2 | Pending |
| GYM-07  | Phase 2 | Pending |
| GYM-08  | Phase 2 | Pending |
| GYM-09  | Phase 2 | Pending |
| E4-01   | Phase 3 | Pending |
| E4-02   | Phase 3 | Pending |
| E4-03   | Phase 3 | Pending |
| E4-04   | Phase 3 | Pending |
| E4-05   | Phase 3 | Pending |
| E4-06   | Phase 3 | Pending |
| E4-07   | Phase 3 | Pending |
| E4-08   | Phase 3 | Pending |
| E4-09   | Phase 3 | Pending |
| SVC-01  | Phase 4 | Pending |
| SVC-02  | Phase 4 | Pending |
| SVC-03  | Phase 4 | Pending |
| BATTLE-01   | Phase 5 | Pending |
| BATTLE-02   | Phase 5 | Pending |
| BATTLE-03   | Phase 5 | Pending |
| BATTLE-04   | Phase 5 | Pending |
| E4BATTLE-01 | Phase 6 | Pending |
| E4BATTLE-02 | Phase 6 | Pending |
| E4BATTLE-03 | Phase 6 | Pending |
| E4BATTLE-04 | Phase 6 | Pending |
