# S02: Post-Battle Mega Stone Award

**Goal:** After winning a gym, elite four, or champion battle, award a mega stone if one or more team Pokémon are mega-capable and their stone is not yet held. When multiple candidates exist, spin PokemonFromAuxListRouletteComponent to select the recipient. Stone is added to trainerItems via the existing addToItems API. hasItem guard prevents duplicates.
**Demo:** After this: win a gym battle with a mega-capable Pokémon → mega stone appears in trainer items; wheel spins when multiple eligible Pokémon exist; no duplicate stones.

## Must-Haves

- Winning any battle with a mega-capable Pokémon on team and no stone held → stone appears in trainerItems\n- Multiple eligible candidates → wheel spins to select one\n- Stone already held → no duplicate awarded; flow falls through normally\n- No mega-capable Pokémon or all stones held → existing alt-prize / check-evolution flow unchanged\n- tsc --noEmit exits 0, ng build exits 0

## Proof Level

- This slice proves: integration

## Integration Closure

Upstream consumed: pokemonMegaForms (base ID → PokemonItem[]), megaStoneNameForBaseId (base ID → ItemName | undefined), itemsData records for all 86 stones, trainerService.hasItem / addToItems / getTeam, GameStateService.setNextState / finishCurrentState, existing select-from-pokemon-list game state + PokemonFromAuxListRouletteComponent wiring.\nNew wiring: award-mega-stone GameState added; RouletteContainerComponent gets awardMegaStone() and continueAfterMegaStoneAward() methods; gymBattleResult / eliteFourBattleResult / championBattleResult win branches call awardMegaStone before check-evolution.\nRemaining for end-to-end: S03 pre-battle mega form application, S04 animation modal.

## Verification

- console.log stone award events (pokemon name + stone name) for diagnostics; altPrizeModal shown when no eligible candidates as fallback signal

## Tasks

- [x] **T01: Add award-mega-stone GameState and getMegaStoneEligiblePokemon helper to TrainerService** `est:30m`
  Why: The stone award flow needs a new game state so RouletteContainerComponent can show the wheel then return control for the award step. TrainerService needs a helper that returns team Pokémon whose mega stone is not yet in inventory — this is the single source of truth for eligibility, and keeping it in TrainerService avoids duplicating the hasItem + pokemonMegaForms lookup across three result handlers.
  - Files: `src/app/services/game-state-service/game-state.ts`, `src/app/services/trainer-service/trainer.service.ts`
  - Verify: npx tsc --noEmit --project tsconfig.app.json

- [x] **T02: Implement awardMegaStone flow in RouletteContainerComponent and wire into all three battle result handlers** `est:90m`
  Why: The three battle win handlers (gymBattleResult, eliteFourBattleResult, championBattleResult) currently proceed directly to check-evolution after a win. This task inserts the mega stone award step before check-evolution using the existing select-from-pokemon-list + award-mega-stone game state pair.
  - Files: `src/app/main-game/roulette-container/roulette-container.component.ts`, `src/app/main-game/roulette-container/roulette-container.component.html`, `src/assets/i18n/en.json`, `src/assets/i18n/es.json`, `src/assets/i18n/de.json`, `src/assets/i18n/fr.json`, `src/assets/i18n/it.json`, `src/assets/i18n/pt.json`
  - Verify: npx tsc --noEmit --project tsconfig.app.json

- [x] **T03: Build verification and smoke-test the full award flow** `est:20m`
  Why: The executor must confirm the feature compiles cleanly through AOT and that the award logic is reachable. Since Karma/Jasmine has a pre-existing ETIMEDOUT issue on Windows, verification is done via tsc + ng build (same proof as S01 T03).
  - Verify: ng build --project pokemon-roulette

## Files Likely Touched

- src/app/services/game-state-service/game-state.ts
- src/app/services/trainer-service/trainer.service.ts
- src/app/main-game/roulette-container/roulette-container.component.ts
- src/app/main-game/roulette-container/roulette-container.component.html
- src/assets/i18n/en.json
- src/assets/i18n/es.json
- src/assets/i18n/de.json
- src/assets/i18n/fr.json
- src/assets/i18n/it.json
- src/assets/i18n/pt.json
