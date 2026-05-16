---
estimated_steps: 10
estimated_files: 1
skills_used: []
---

# T01: Extend TrainerService with dynamic mega form apply/revert

Why: The existing applyBattleForms/revertBattleForms system uses a static temporaryBattleForms record (Palafin). Mega forms are conditional on stone possession and per-battle selection, so they need a separate dynamic pass that checks trainerItems at battle entry.

Do:
1. Add `private megaBattleBaseId: number | null = null` to TrainerService.
2. Add public `getMegaBattleCandidates(): PokemonItem[]` — returns team members (deduplicated by pokemonId) whose base pokemonId exists in pokemonMegaForms AND for whom at least one stone is held in trainerItems (check via hasItem + megaStoneNameForBaseId; for multi-stone species check each mega form's associated stone via getFirstAvailableMegaStoneNameForPokemon).
3. Add public `setMegaBattlePokemon(baseId: number | null): void` — assigns megaBattleBaseId.
4. Add private `applyMegaForms(): boolean` — if megaBattleBaseId is null AND getMegaBattleCandidates().length === 1, auto-set megaBattleBaseId. Then if megaBattleBaseId is set, find the Pokémon in trainerTeam with that pokemonId, look up its mega forms in pokemonMegaForms, pick the first form whose corresponding stone is held (use hasItem), structuredClone it, copy shiny, loadPokemonSpriteIfMissing, replace in trainerTeam, log `[Mega] Applying <megaForm.text> for battle`. Return whether any swap occurred.
5. Add private `revertMegaForms(): boolean` — for each entry in pokemonMegaForms, if the base form pokemonId is NOT in team but the mega pokemonId IS (i.e. a mega is currently applied), swap back to base form (structuredClone, copy shiny, loadPokemonSpriteIfMissing). After revert, set megaBattleBaseId = null, log `[Mega] Reverted to base form`. Return whether any swap occurred.
6. In applyBattleForms(), add: `changed = this.applyMegaForms() || changed` after the existing replaceTemporaryForms calls.
7. In revertBattleForms(), add: `changed = this.revertMegaForms() || changed` after the existing replaceTemporaryForms calls.

Done when: getMegaBattleCandidates, setMegaBattlePokemon, applyMegaForms, revertMegaForms are present and tsc --noEmit exits 0.

## Inputs

- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/services/trainer-service/pokemon-mega-forms.ts`
- `src/app/services/items-service/item-names.ts`

## Expected Output

- `src/app/services/trainer-service/trainer.service.ts`

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json

## Observability Impact

console.log on apply ([Mega] Applying <form>) and revert ([Mega] Reverted) for battle-entry diagnostics
