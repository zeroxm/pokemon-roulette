---
estimated_steps: 23
estimated_files: 8
skills_used: []
---

# T02: Wire pre-battle mega selection into RouletteContainerComponent

Why: R004 requires a wheel spin when the player holds stones for multiple team Pokémon before each battle. The RouletteContainerComponent already has a continueWithPokemon dispatch pattern (used for award-mega-stone, evolve-pokemon, etc.) and an auxPokemonList + select-from-pokemon-list flow that drives the PokemonFromAuxListRouletteComponent wheel. This task wires the same pattern for pre-battle mega selection.

Do:
1. Add `'select-mega-evolution'` to the GameState union in `src/app/services/game-state-service/game-state.ts`.
2. Add i18n key `megaWho` (who mega-evolves this battle?) in all six locale files: src/assets/i18n/en.json, es.json, de.json, fr.json, it.json, pt.json — use the same nesting pattern as the existing `megaStone` keys added by S02.
3. In RouletteContainerComponent, add `prepareMegaEvolution(): void` method:
   - Call `const candidates = this.trainerService.getMegaBattleCandidates()`.
   - If 0 candidates: return immediately (no mega this battle).
   - If 1 candidate: call `this.trainerService.setMegaBattlePokemon(candidates[0].pokemonId)`; return.
   - If 2+ candidates: set `this.auxPokemonList = candidates`, `this.customWheelTitle = 'game.main.roulette.mega.who'`, `this.gameStateService.setNextState('select-mega-evolution')`, `this.gameStateService.setNextState('select-from-pokemon-list')`. Do NOT call finishCurrentState here — prepareMegaEvolution is called from onGameStateChange of battle components before the leader modal opens.
4. In the `continueWithPokemon` switch in RouletteContainerComponent, add:
   ```
   case 'select-mega-evolution':
     this.trainerService.setMegaBattlePokemon(pokemon.pokemonId);
     break;
   ```
5. In `GymBattleRouletteComponent.onGameStateChange`, before opening the gymLeaderPresentationModal, call `this.rouletteContainer.prepareMegaEvolution()` — BUT since BaseBattleRouletteComponent does not hold a reference to RouletteContainerComponent, the cleaner approach is: expose `prepareMegaEvolution` as a protected method on BaseBattleRouletteComponent and inject RouletteContainerComponent, OR keep pre-battle mega selection entirely in RouletteContainerComponent by intercepting state transitions. PREFERRED APPROACH: In RouletteContainerComponent.onGameStateChange (the existing switch on `this.currentGameState`), handle `'gym-battle'`, `'elite-four-battle'`, `'champion-battle'` cases — call `prepareMegaEvolution()` which pushes `select-mega-evolution` + `select-from-pokemon-list` BEFORE those battle states are consumed. Since GameStateService uses a queue, insert the mega-selection states INTO the queue before the battle states are set. Concretely: in the `startGymBattle`, `startEliteFourBattle`, `startChampionBattle` flow hooks (or wherever the battle state is pushed to the queue), prepend the mega states if candidates exist.

   REVISED PREFERRED APPROACH (simpler, least invasive): Add a new public method `maybePushMegaSelectionBeforeBattle(): void` on RouletteContainerComponent that:
   - Gets candidates.
   - If 2+: pushes `select-mega-evolution` then `select-from-pokemon-list` onto the state queue (setNextState twice) before the caller pushes the battle state. The caller (wherever gym/elite/champion state is set) calls this first.
   - If 1: setMegaBattlePokemon directly.
   - If 0: no-op.
   Locate where gym-battle, elite-four-battle, champion-battle states are pushed in RouletteContainerComponent and call maybePushMegaSelectionBeforeBattle() immediately before each setNextState('gym-battle') / setNextState('elite-four-battle') / setNextState('champion-battle').

Done when: select-mega-evolution is in game-state.ts; 2+ stone holder path pushes the wheel; continueWithPokemon routes award to setMegaBattlePokemon; single/zero candidate paths work without wheel; tsc exits 0.

## Inputs

- `src/app/services/game-state-service/game-state.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/assets/i18n/en.json`

## Expected Output

- `src/app/services/game-state-service/game-state.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json
