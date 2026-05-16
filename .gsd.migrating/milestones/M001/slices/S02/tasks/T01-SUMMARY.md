---
id: T01
parent: S02
milestone: M001
key_files:
  - src/app/services/game-state-service/game-state.ts
  - src/app/services/trainer-service/trainer.service.ts
key_decisions:
  - Multi-stone Pokémon (Charizard, Mewtwo, Raichu) included as eligible candidates unconditionally; T02 award logic resolves the specific stone via getFirstAvailableMegaStoneNameForPokemon
  - Deduplication by base pokemonId prevents double-awarding when two team members share a base species
duration: 
verification_result: passed
completed_at: 2026-05-16T12:29:09.762Z
blocker_discovered: false
---

# T01: Added 'award-mega-stone' GameState and getMegaStoneEligiblePokemon/getFirstAvailableMegaStoneNameForPokemon helpers to TrainerService

**Added 'award-mega-stone' GameState and getMegaStoneEligiblePokemon/getFirstAvailableMegaStoneNameForPokemon helpers to TrainerService**

## What Happened

Added 'award-mega-stone' to the GameState union in game-state.ts. In trainer.service.ts, imported pokemonMegaForms and megaStoneNameForBaseId from pokemon-mega-forms, then added two public methods: getMegaStoneEligiblePokemon() iterates the team, checks pokemonMegaForms[baseId] for mega capability, deduplicates by base ID, and returns candidates whose stone(s) are not fully held (1:1 cases gated by hasItem; multi-stone cases included as candidates for T02 award logic). getFirstAvailableMegaStoneNameForPokemon() returns the first unheld stone for 1:1 cases, with a TODO for multi-stone expansion.

## Verification

tsc --noEmit --project tsconfig.app.json exits 0; grep confirms 'award-mega-stone' present in game-state.ts.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit --project tsconfig.app.json` | 0 | ✅ pass | 3932ms |
| 2 | `grep -q 'award-mega-stone' src/app/services/game-state-service/game-state.ts` | 0 | ✅ pass | 50ms |

## Deviations

None.

## Known Issues

getFirstAvailableMegaStoneNameForPokemon returns undefined for multi-stone Pokémon (Charizard, Mewtwo, Raichu) — marked TODO for T02 expansion.

## Files Created/Modified

- `src/app/services/game-state-service/game-state.ts`
- `src/app/services/trainer-service/trainer.service.ts`
