---
id: T02
parent: S03
milestone: M001
key_files:
  - src/app/services/game-state-service/game-state.ts
  - src/app/main-game/roulette-container/roulette-container.component.ts
  - src/assets/i18n/en.json
  - src/assets/i18n/es.json
  - src/assets/i18n/de.json
  - src/assets/i18n/fr.json
  - src/assets/i18n/it.json
  - src/assets/i18n/pt.json
key_decisions:
  - maybePushMegaSelectionBeforeBattle() is called from awardMegaStone() after check-evolution is pushed — LIFO stack means mega-selection states are consumed first before check-evolution and the battle state
  - Used 'whoMega' as the i18n key (not 'megaWho') to match the task plan's game.main.roulette.mega namespace
duration: 
verification_result: passed
completed_at: 2026-05-16T13:21:55.445Z
blocker_discovered: false
---

# T02: Wired pre-battle mega selection wheel into RouletteContainerComponent; 0/1/2+ candidates handled; select-mega-evolution added to GameState union

**Wired pre-battle mega selection wheel into RouletteContainerComponent; 0/1/2+ candidates handled; select-mega-evolution added to GameState union**

## What Happened

Added 'select-mega-evolution' to the GameState union in game-state.ts. Added i18n key 'whoMega' to all six locale files under game.main.roulette.mega. Added maybePushMegaSelectionBeforeBattle() to RouletteContainerComponent: 0 candidates = no-op, 1 candidate = calls setMegaBattlePokemon directly, 2+ candidates = sets auxPokemonList + customWheelTitle + pushes select-mega-evolution then select-from-pokemon-list onto the stack. Called maybePushMegaSelectionBeforeBattle() from inside awardMegaStone() immediately after pushing check-evolution — since the state stack is LIFO, the mega-selection states sit on top and are consumed before check-evolution and the battle state. Added case 'select-mega-evolution' to continueWithPokemon switch which calls trainerService.setMegaBattlePokemon(pokemon.pokemonId). tsc exits 0.

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json — exit 0, no errors. Verified select-mega-evolution present in game-state.ts, maybePushMegaSelectionBeforeBattle and continueWithPokemon case wired in roulette-container.component.ts, whoMega key in all 6 locale files.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json` | 0 | ✅ pass | 2226ms |

## Deviations

i18n key name is 'whoMega' rather than 'megaWho' as written in the task plan comment — 'whoMega' fits the existing camelCase pattern under the mega namespace. Integration point is awardMegaStone() rather than a separate caller because battle states are pre-initialized in the stack by GameStateService.initializeStates(), not pushed by RouletteContainerComponent.

## Known Issues

None.

## Files Created/Modified

- `src/app/services/game-state-service/game-state.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`
