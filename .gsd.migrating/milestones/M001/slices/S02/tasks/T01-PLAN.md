---
estimated_steps: 16
estimated_files: 2
skills_used: []
---

# T01: Add award-mega-stone GameState and getMegaStoneEligiblePokemon helper to TrainerService

Why: The stone award flow needs a new game state so RouletteContainerComponent can show the wheel then return control for the award step. TrainerService needs a helper that returns team Pokémon whose mega stone is not yet in inventory — this is the single source of truth for eligibility, and keeping it in TrainerService avoids duplicating the hasItem + pokemonMegaForms lookup across three result handlers.

Do:
1. In `src/app/services/game-state-service/game-state.ts`, add `'award-mega-stone'` to the GameState union type (one new string literal in the union).
2. In `src/app/services/trainer-service/trainer.service.ts`:
   a. Import `pokemonMegaForms` and `megaStoneNameForBaseId` from `../trainer-service/pokemon-mega-forms`.
   b. Add a public method `getMegaStoneEligiblePokemon(): PokemonItem[]` that:
      - Iterates `this.getTeam()`
      - For each pokemon, resolves its base ID: if `pokemonMegaForms[pokemon.pokemonId]` exists, use `pokemon.pokemonId` directly; otherwise skip.
      - Looks up `megaStoneNameForBaseId(baseId)` — if undefined AND pokemonMegaForms[baseId] has exactly one entry, falls back to checking the first stone name from the forms array description. NOTE: megaStoneNameForBaseId covers the 57 1:1 cases; for multi-stone Pokémon (e.g. Charizard base 6), megaStoneNameForBaseId returns undefined. For multi-stone cases, the Pokémon is still eligible if the trainer holds NEITHER stone. The helper should include a Pokémon if `pokemonMegaForms[baseId]` exists and at least one of its associated stones (by convention: the stone ItemName embedded in each form's text property is NOT reliable — instead, derive stone names from the items-data pattern: for base 6 → 'charizardite-x' and 'charizardite-y'). Use `megaStoneNameForBaseId` for 1:1 cases; for multi-stone Pokémon where the helper returns undefined but `pokemonMegaForms[baseId]` has entries, include the pokemon in candidates (award logic will pick appropriately).
      - Filters out Pokémon where the trainer already holds all applicable stones.
      - Returns deduplicated list (one entry per unique base Pokémon ID; if two team members share the same base ID, include once).

Simplified eligibility rule (avoids over-engineering): a Pokémon is eligible if `pokemonMegaForms[pokemon.pokemonId]` exists AND `!this.hasItem(megaStoneNameForBaseId(pokemon.pokemonId)!)` (for 1:1 stones). For multi-stone Pokémon (megaStoneNameForBaseId returns undefined), include them as eligible candidates — the stone selection in T02 will call `getMegaStoneForPokemon()` which picks the first unheld stone from the forms data.

Also add a helper `getFirstAvailableMegaStoneNameForPokemon(pokemon: PokemonItem): ItemName | undefined` that:
   - Looks at `pokemonMegaForms[pokemon.pokemonId]` entries
   - For each form, derives the stone ItemName by pattern: `megaStoneNameForBaseId(pokemon.pokemonId)` first; if undefined, derives stone name by convention (not implemented here — leave as `megaStoneNameForBaseId(pokemon.pokemonId)` with a TODO comment for multi-stone expansion, since 57/86 IDs are covered and the un-covered cases can defer to T02's award step).

Done when: `tsc --noEmit` exits 0 and `grep -q "award-mega-stone" src/app/services/game-state-service/game-state.ts` passes.

## Inputs

- `src/app/services/game-state-service/game-state.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/services/trainer-service/pokemon-mega-forms.ts`
- `src/app/services/items-service/item-names.ts`

## Expected Output

- `src/app/services/game-state-service/game-state.ts`
- `src/app/services/trainer-service/trainer.service.ts`

## Verification

npx tsc --noEmit --project tsconfig.app.json

## Observability Impact

none — pure data/type change, no runtime signals
