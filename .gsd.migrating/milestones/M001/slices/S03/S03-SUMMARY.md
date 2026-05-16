---
id: S03
parent: M001
milestone: M001
provides:
  - ["applyMegaForms/revertMegaForms in TrainerService (battle-entry/exit form swap)", "getMegaBattleCandidates/setMegaBattlePokemon in TrainerService (S04 can query which Pokémon mega-evolved this battle)", "select-mega-evolution GameState literal (S04 can inspect or extend the wheel flow)", "megaBattleBaseId and megaBattleOriginalPokemon service fields (diagnostic + revert state)"]
requires:
  - slice: S01
    provides: pokemonMegaForms map, mega stone ItemName literals
  - slice: S02
    provides: stone in trainerItems guarantee before battle entry
affects:
  - ["S04"]
key_files:
  - ["src/app/services/trainer-service/trainer.service.ts", "src/app/services/game-state-service/game-state.ts", "src/app/main-game/roulette-container/roulette-container.component.ts", "src/assets/i18n/en.json", "src/assets/i18n/es.json", "src/assets/i18n/de.json", "src/assets/i18n/fr.json", "src/assets/i18n/it.json", "src/assets/i18n/pt.json"]
key_decisions:
  - ["Stored original PokemonItem at apply-time (megaBattleOriginalPokemon) for faithful revert — pokemonMegaForms only has mega forms, not base form data", "maybePushMegaSelectionBeforeBattle() called from awardMegaStone() handler (not a separate battle-entry hook) because battle states are pre-initialized by GameStateService.initializeStates()", "i18n key is whoMega (not megaWho) to match existing camelCase convention under the mega namespace", "1 candidate → auto-apply without wheel; 2+ candidates → wheel spin (LIFO stack ordering ensures mega-selection consumed before check-evolution and battle state)"]
patterns_established:
  - ["Pre-battle conditional wheel: push select-mega-evolution states via maybePushMegaSelectionBeforeBattle() from the award handler; LIFO stack consumes them before battle state", "Dynamic form swap: store original PokemonItem at apply-time in a service field; revert reads from that field, not from the forms map"]
observability_surfaces:
  - ["console.log on mega form apply (Pokémon name + mega form name)", "console.log on mega form revert (Pokémon name)", "megaBattleBaseId readable via TrainerService for runtime inspection"]
drill_down_paths:
  - [".gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md", ".gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md", ".gsd/milestones/M001/slices/S03/tasks/T03-SUMMARY.md"]
duration: ""
verification_result: passed
completed_at: 2026-05-16T13:37:27.482Z
blocker_discovered: false
---

# S03: Pre-Battle Mega Evolution Logic

**TrainerService gains getMegaBattleCandidates/applyMegaForms/revertMegaForms; RouletteContainerComponent wires a pre-battle mega-selection wheel via select-mega-evolution GameState; tsc and ng build exit 0 clean.**

## What Happened

T01 extended TrainerService with four new methods: getMegaBattleCandidates() (returns team Pokémon that hold a matching mega stone), setMegaBattlePokemon() (records the chosen Pokémon's base ID), applyMegaForms() (swaps the live PokemonItem to the mega form and caches the original for revert), and revertMegaForms() (restores the cached original PokemonItem and clears megaBattleBaseId). applyBattleForms and revertBattleForms were wired to call these new methods, and console.log diagnostics were added for apply/revert events. A key deviation from the plan: the original base-form PokemonItem is stored at apply-time (megaBattleOriginalPokemon) because pokemonMegaForms only contains mega-form entries — base form text/fillStyle/weight cannot be reconstructed from that map.

T02 added the select-mega-evolution literal to the GameState union and wired maybePushMegaSelectionBeforeBattle() into RouletteContainerComponent. This method checks for 0, 1, or 2+ mega candidates: 0 candidates → no-op; 1 candidate → calls setMegaBattlePokemon directly and skips the wheel; 2+ candidates → pushes select-mega-evolution states onto the stack (one per candidate), which drives the existing PokemonFromAuxListRouletteComponent wheel. The method is called from the awardMegaStone() handler because battle states are pre-initialized in the stack by GameStateService.initializeStates(); the LIFO stack ensures mega-selection is consumed before check-evolution and the battle state. i18n key 'whoMega' (not 'megaWho') was used to match the existing camelCase pattern under the mega namespace, and was added to all six locale files (en, es, de, fr, it, pt).

T03 confirmed tsc --noEmit exits 0 and ng build exits 0 (warnings only, no errors). Five symbol grep checks all passed: getMegaBattleCandidates, setMegaBattlePokemon, applyMegaForms, revertMegaForms in trainer.service.ts; select-mega-evolution in game-state.ts; maybePushMegaSelectionBeforeBattle in roulette-container.component.ts. No code changes were needed in T03 — T01/T02 artifacts compiled clean end-to-end.

## Verification

tsc --noEmit exit 0; ng build exit 0 (warnings only); 5/5 symbol greps pass; all tasks T01/T02/T03 complete.

## Requirements Advanced

- R004 — maybePushMegaSelectionBeforeBattle() enforces single-mega-per-battle rule with wheel when multiple holders exist
- R006 — revertMegaForms() called from revertBattleForms() restores base form on battle exit
- R008 — applyMegaForms() sets power = 5 on the mega-evolved Pokémon's PokemonItem, contributing max weight to victory odds

## Requirements Validated

- R006 — revertMegaForms() wired into revertBattleForms(), restores megaBattleOriginalPokemon and clears megaBattleBaseId; tsc + ng build pass clean
- R007 — Stone is never removed from trainerItems during apply or revert — only read, not consumed
- R008 — applyMegaForms() sets the selected PokemonItem to power = 5 before battle odds are calculated

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

T01: Original PokemonItem stored at apply-time (megaBattleOriginalPokemon field) rather than reconstructing base form from pokemonMegaForms key — that map only contains mega forms. T02: i18n key is 'whoMega' not 'megaWho' (matches existing camelCase convention); integration point is awardMegaStone() handler rather than a separate battle-entry hook (battle states are pre-initialized by GameStateService.initializeStates()).

## Known Limitations

S04 animation modal (sphere → crack → reveal → icon dissolve before gym leader presentation) is not yet implemented — that is the scope of S04. Live browser rendering of the mega-selection wheel has not been manually verified; artifact-level verification (tsc, ng build, symbol greps) is the proof level for this slice.

## Follow-ups

S04: wire the animation modal to fire before gym leader/elite four/champion presentation, consuming the megaBattleBaseId set by setMegaBattlePokemon() to know which Pokémon's animation to play.

## Files Created/Modified

- `src/app/services/trainer-service/trainer.service.ts` — Added getMegaBattleCandidates, setMegaBattlePokemon, applyMegaForms, revertMegaForms; wired into applyBattleForms/revertBattleForms; added megaBattleBaseId and megaBattleOriginalPokemon state fields
- `src/app/services/game-state-service/game-state.ts` — Added select-mega-evolution to GameState union type
- `src/app/main-game/roulette-container/roulette-container.component.ts` — Added maybePushMegaSelectionBeforeBattle() and wired select-mega-evolution case in continueWithPokemon dispatch
- `src/assets/i18n/en.json` — Added whoMega i18n key under game.main.roulette.mega namespace
- `src/assets/i18n/es.json` — Added whoMega i18n key
- `src/assets/i18n/de.json` — Added whoMega i18n key
- `src/assets/i18n/fr.json` — Added whoMega i18n key
- `src/assets/i18n/it.json` — Added whoMega i18n key
- `src/assets/i18n/pt.json` — Added whoMega i18n key
