---
estimated_steps: 42
estimated_files: 8
skills_used: []
---

# T02: Implement awardMegaStone flow in RouletteContainerComponent and wire into all three battle result handlers

Why: The three battle win handlers (gymBattleResult, eliteFourBattleResult, championBattleResult) currently proceed directly to check-evolution after a win. This task inserts the mega stone award step before check-evolution using the existing select-from-pokemon-list + award-mega-stone game state pair.

Do:
1. In `src/app/main-game/roulette-container/roulette-container.component.ts`:

   a. Import `pokemonMegaForms` and `megaStoneNameForBaseId` from the trainer-service folder.
   b. Import `ItemsService` is already injected as `this.itemService`.

   c. Add private helper `getMegaCandidates(): PokemonItem[]`:
      - Calls `this.trainerService.getMegaStoneEligiblePokemon()` (added in T01).
      - Returns the result directly.

   d. Add public method `awardMegaStone(): void`:
      - Calls `getMegaCandidates()`.
      - If 0 candidates: fall through to existing alt-prize/potion or check-evolution (no stone action). Just call `this.chooseWhoWillEvolve('gym-battle')` or pass through — see integration note below.
      - If 1 candidate: directly call `grantMegaStone(candidate)`.
      - If 2+ candidates: set `this.auxPokemonList = candidates`, `this.customWheelTitle = 'game.main.roulette.mega.who'`, push `'award-mega-stone'` then `'select-from-pokemon-list'` states, then `finishCurrentState()`.

   e. Add private method `grantMegaStone(pokemon: PokemonItem): void`:
      - Derives `stoneName = megaStoneNameForBaseId(pokemon.pokemonId)`.
      - If `stoneName` is defined and `!this.trainerService.hasItem(stoneName)`: calls `this.trainerService.addToItems(this.itemService.getItem(stoneName))`, plays `itemFoundAudio`, opens `altPrizeModal` with localization keys `'game.main.altPrizes.megaStone.stone'` and `'game.main.altPrizes.megaStone.stoneDesc'`, then after modal close → `chooseWhoWillEvolve(currentEventSource)`.
      - If stone already held or stoneName undefined: skip award, call `chooseWhoWillEvolve(currentEventSource)` directly.
      - Store `currentEventSource: EventSource` as a component field set before `awardMegaStone` is called.

   f. Add public method `continueAfterMegaStoneAward(pokemon: PokemonItem): void`:
      - Called from `continueWithPokemon` switch when `currentGameState === 'award-mega-stone'`.
      - Calls `grantMegaStone(pokemon)` and `finishCurrentState()`.

   g. Extend `continueWithPokemon` switch to handle `'award-mega-stone'` case: call `continueAfterMegaStoneAward(pokemon)` (already dispatches to grantMegaStone internally).

   h. Modify `gymBattleResult(result: boolean)` win branch:
      - Before `setNextState('check-evolution')`, set `this.currentEventSource = 'gym-battle'` and call `awardMegaStone()` which pushes states and calls finishCurrentState — so remove the direct finishCurrentState call from the win branch and let awardMegaStone handle flow. Actually: push `'check-evolution'` first (it stays at end of queue), then push `'award-mega-stone'` states inside awardMegaStone. OR: simply call `awardMegaStone()` and have it push `'check-evolution'` as part of its flow when done.
      - Cleanest approach: `awardMegaStone` always pushes `'check-evolution'` onto the queue before its own states, then calls `finishCurrentState()`. The battle result handlers remove their own `setNextState('check-evolution')` call and instead call `awardMegaStone()`.

   i. Modify `eliteFourBattleResult` and `championBattleResult` win branches similarly.

   NOTE on EventSource: 'gym-battle', 'elite-four-battle', 'champion-battle' are not in EventSource. Only use the event source for the no-candidates fallback path. For the no-candidates fallback in gym battles, call `chooseWhoWillEvolve('gym-battle')` (existing behavior). For elite/champion, no alt prize exists — just call `finishCurrentState()` after `setNextState('check-evolution')`.

   SIMPLIFICATION: Since awardMegaStone must behave slightly differently per caller (gym has an alt prize for 0-evolvers, elite/champion do not), store the battle type and pass it through. Add `private pendingBattleType: 'gym' | 'elite-four' | 'champion' = 'gym'` and set it in each result handler before calling awardMegaStone.

2. In `src/app/main-game/roulette-container/roulette-container.component.html`:
   - The `select-from-pokemon-list` case already handles `auxPokemonList` and `customWheelTitle` and emits `selectedMemberEvent` → `continueWithPokemon`. No template change needed for the wheel.
   - Add `@case ('award-mega-stone') {}` — empty case (the award-mega-stone state only shows while waiting for select-from-pokemon-list sub-state; the actual award happens in continueWithPokemon). Actually this state is consumed immediately in the state machine so no visual needed, but the `@switch` may need an explicit case or the default handles it. Check existing template for default case and add a no-op case if needed.

3. In `src/assets/i18n/en.json` (and es.json, de.json, fr.json, it.json, pt.json):
   - Add under `game.main.altPrizes`:
     ```json
     "megaStone": {
       "stone": "Got a Mega Stone!",
       "stoneDesc": "Your Pokémon is now able to Mega Evolve!"
     }
     ```
   - For non-English files, use reasonable translations or copy English as fallback.

4. In `src/app/main-game/roulette-container/roulette-container.component.ts`, add `'game.main.roulette.mega.who'` as the wheel title i18n key for the candidate wheel (add the key to en.json: `game.main.roulette.mega.who = "Who will receive a Mega Stone?"`).

Done when: `tsc --noEmit` exits 0 and `ng build --project pokemon-roulette` exits 0 with 0 errors.

## Inputs

- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/app/main-game/roulette-container/roulette-container.component.html`
- `src/app/services/game-state-service/game-state.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/services/trainer-service/pokemon-mega-forms.ts`
- `src/app/services/items-service/item-names.ts`
- `src/app/services/items-service/items.service.ts`
- `src/assets/i18n/en.json`

## Expected Output

- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/app/main-game/roulette-container/roulette-container.component.html`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`

## Verification

npx tsc --noEmit --project tsconfig.app.json

## Observability Impact

console.log('[MegaStone] Awarded <stoneName> to <pokemon.text>') in grantMegaStone for diagnostics
