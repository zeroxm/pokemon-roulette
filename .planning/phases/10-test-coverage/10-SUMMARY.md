# Phase 10: Test Coverage — Summary

**Status:** Complete  
**Tests added:** 40 new (177 → 217)  
**Regressions:** 0

## What was done

### PLAN-01 — Battle roulette specs (14 new tests)

**gym-battle-roulette.component.spec.ts (+10)**
- `calcVictoryOdds`: empty team, power-2 team, round-2 extra-no
- Type-matchup branches: overwhelming (+3 yes), advantage (+2 yes), disadvantage ≤3 (+1 no), disadvantage >3 (+2 no)
- `onItemSelected`: win emits true, potion consumed + retries reset, no-potion emits false
- Multi-leader `fromLeaderChange` (Gen 5 round 0)

**elite-four-battle-roulette.component.spec.ts (+4)**
- `calcVictoryOdds`: 2 base-no slices (vs gym's 1), advantage branch
- Hyper-potion: retries reset to 3, item consumed
- Gen 8 multi-elite `fromEliteChange`

### PLAN-02 — RouletteContainerComponent (25 new tests)

**roulette-container.component.spec.ts (+25)**
- All 8 zero-evolvable `chooseWhoWillEvolve` branches (gym-battle → buyPotions, visit-daycare → mysteriousEgg, battle-rival → findItem, battle-trainer → buyPotions, team-rocket-encounter → findItem, snorlax-encounter → findItem, rare-candy → doNothing, default → doNothing)
- Single-evolvable path (private `evolvePokemon` spy)
- Multi-evolvable path (state → select-from-pokemon-list)
- `stealPokemon`: team≥2 state setup, auxPokemonList length, team<2 modal guard
- `tradePokemon`: single-member currentContextPokemon, multi-member state, multi auxList
- `handleRareCandyEvolution`: evolvable path, no-evolvable no-op

### PLAN-03 — Service specs (7 new tests)

**game-state.service.spec.ts (+4)**
- `finishCurrentState` emits character-select from reset state
- `finishCurrentState` returns the popped state
- `setNextState` inserts on top (LIFO)
- Multiple `setNextState` calls popped in LIFO order

**pokedex.service.spec.ts (+3)**
- SHINY-EDGE-01: won flag preserved on shiny upgrade
- SHINY-EDGE-02: explicit `markSeen(id, false)` does not revert shiny
- SHINY-EDGE-03: no-op re-catch does not emit pokedex$

## Commits
- `ea84f02` — test(10): GameStateService stack transitions, PokedexService shiny edge cases
- `6274f94` — test(10): roulette-container — chooseWhoWillEvolve branches, stealPokemon, tradePokemon, handleRareCandyEvolution
- `e9458ad` — test(10): battle roulette specs — calcVictoryOdds, type-matchup, potion flow
