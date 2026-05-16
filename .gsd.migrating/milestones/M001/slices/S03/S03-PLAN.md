# S03: Pre-Battle Mega Evolution Logic

**Goal:** At battle entry, apply the Mega form (power = 5) to the selected Pokémon if a stone is held; revert to base form on battle exit; stone remains in inventory. Multiple stone holders trigger a pre-battle wheel to pick which Pokémon mega-evolves.
**Demo:** After this: entering a battle with a stone + matching Pokémon applies the Mega form (power = 5 visible in victory odds); battle exit reverts to base form; stone stays in inventory.

## Must-Haves

- getMegaBattleCandidates() returns team Pokémon with held stone + mega form data
- applyMegaForms() / revertMegaForms() swap PokemonItem to/from mega form in trainerTeam
- Battle entry with one stone holder: auto-applies mega form; power = 5 visible in victory odds
- Battle entry with two+ stone holders: select-mega-evolution wheel spins; chosen Pokémon mega-evolves
- Battle exit: mega form reverts, base form restored, megaBattleBaseId cleared
- Stone stays in trainerItems after battle
- tsc --noEmit exits 0; ng build exits 0 with 0 errors

## Proof Level

- This slice proves: integration — form swap is exercised via syncBattleForms on battle state entry/exit; power = 5 is visible in calcVictoryOdds output

## Integration Closure

Upstream consumed: pokemonMegaForms (S01), megaStoneNameForBaseId (S01), trainerItems stone guarantee (S02), existing applyBattleForms/revertBattleForms/replaceTemporaryForms in TrainerService, continueWithPokemon dispatch in RouletteContainerComponent. New wiring: select-mega-evolution GameState literal; pre-battle wheel flow in RouletteContainerComponent mirroring award-mega-stone pattern; applyMegaForms/revertMegaForms called from applyBattleForms/revertBattleForms. Remaining before milestone end-to-end: S04 animation modal before leader presentation.

## Verification

- console.log lines on mega form apply/revert (pokemon name + form name) for diagnostics; megaBattleBaseId readable via TrainerService for inspection

## Tasks

- [x] **T01: Extend TrainerService with dynamic mega form apply/revert** `est:45m`
  Why: The existing applyBattleForms/revertBattleForms system uses a static temporaryBattleForms record (Palafin). Mega forms are conditional on stone possession and per-battle selection, so they need a separate dynamic pass that checks trainerItems at battle entry.
  - Files: `src/app/services/trainer-service/trainer.service.ts`
  - Verify: npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json

- [x] **T02: Wire pre-battle mega selection into RouletteContainerComponent** `est:45m`
  Why: R004 requires a wheel spin when the player holds stones for multiple team Pokémon before each battle. The RouletteContainerComponent already has a continueWithPokemon dispatch pattern (used for award-mega-stone, evolve-pokemon, etc.) and an auxPokemonList + select-from-pokemon-list flow that drives the PokemonFromAuxListRouletteComponent wheel. This task wires the same pattern for pre-battle mega selection.
  - Files: `src/app/services/game-state-service/game-state.ts`, `src/app/main-game/roulette-container/roulette-container.component.ts`, `src/assets/i18n/en.json`, `src/assets/i18n/es.json`, `src/assets/i18n/de.json`, `src/assets/i18n/fr.json`, `src/assets/i18n/it.json`, `src/assets/i18n/pt.json`
  - Verify: npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json

- [x] **T03: Build verification — tsc and ng build pass clean** `est:15m`
  Why: AOT compilation catches template type errors that tsc --noEmit misses. This task confirms S03 changes compile end-to-end without introducing errors.
  - Verify: npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json

## Files Likely Touched

- src/app/services/trainer-service/trainer.service.ts
- src/app/services/game-state-service/game-state.ts
- src/app/main-game/roulette-container/roulette-container.component.ts
- src/assets/i18n/en.json
- src/assets/i18n/es.json
- src/assets/i18n/de.json
- src/assets/i18n/fr.json
- src/assets/i18n/it.json
- src/assets/i18n/pt.json
