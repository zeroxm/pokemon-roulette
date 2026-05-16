# S02: Post-Battle Mega Stone Award — UAT

**Milestone:** M001
**Written:** 2026-05-16T13:09:25.349Z

# S02: Post-Battle Mega Stone Award — UAT

**Milestone:** M001
**Written:** 2025-07-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The award logic lives entirely in TypeScript; the build pipeline (tsc + ng build AOT) exercises all branches statically. Live runtime requires a full game session which is outside the CI boundary for this slice.

## Preconditions

- `ng serve` running on localhost
- Trainer has at least one mega-capable Pokémon (e.g., Charizard #6, Blastoise #9, Venusaur #3) on the team
- Trainer does NOT hold the corresponding mega stone in inventory

## Smoke Test

Win any gym battle with Charizard on the team and no Charizardite X or Y held. After the battle result screen, the award flow should trigger (stone appears in trainer items or wheel spins if multiple candidates).

## Test Cases

### 1. Single mega-capable Pokémon — stone awarded directly

1. Ensure team has exactly one mega-capable Pokémon (e.g., Blastoise) and no Blastoisinite held.
2. Win a gym battle.
3. After the win animation, observe the post-battle flow.
4. **Expected:** Stone is added to trainer inventory without a wheel spin. Console logs: `[MegaStone] Awarded <stone> to <pokemon>`.

### 2. Multiple mega-capable Pokémon — wheel spins

1. Ensure team has two or more mega-capable Pokémon (e.g., Charizard + Blastoise) with no stones held for either.
2. Win a gym, elite four, or champion battle.
3. **Expected:** `PokemonFromAuxListRouletteComponent` wheel spins showing the eligible candidates. One stone is awarded to the selected Pokémon.

### 3. Stone already held — no duplicate

1. Ensure trainer already holds Charizardite X in inventory.
2. Win a battle with Charizard on the team.
3. **Expected:** Stone award flow is skipped for Charizard. If no other eligible candidates exist, the alt-prize/check-evolution flow proceeds as before.

### 4. No mega-capable Pokémon — existing flow unchanged

1. Build a team with no mega-capable Pokémon (e.g., all non-mega species).
2. Win a gym battle.
3. **Expected:** `awardMegaStone()` finds zero candidates and falls through to `chooseWhoWillEvolve('gym-battle')` / alt-prize as normal. No stone-related states appear.

### 5. Elite Four and Champion paths

1. Win an elite four or champion battle with a mega-capable Pokémon (no stone held).
2. **Expected:** Same stone award flow triggers. (Elite/champion paths skip the gym alt-prize branch and go directly to stone award → check-evolution.)

## Edge Cases

### Multi-stone Pokémon (Charizard, Mewtwo, Raichu)

1. Have Charizard on team with no stones held.
2. Win a battle.
3. **Expected:** `getFirstAvailableMegaStoneNameForPokemon` resolves the first available stone (Charizardite X). Stone is awarded. Behavior with both stones eventually held: Charizard no longer appears as a candidate.

### Duplicate base species on team

1. (If possible) have two Charizard on the team.
2. Win a battle.
3. **Expected:** Deduplication by base pokemonId ensures Charizard appears as only one candidate, not two.

## Failure Signals

- Stone does not appear in trainer inventory after a win with an eligible Pokémon → `addToItems` call not reached
- Wheel spins but stone never granted → `continueAfterMegaStoneAward` not wired to `award-mega-stone` game state
- Existing evolution/alt-prize flow no longer triggers after a battle → queue ordering bug in `awardMegaStone()`
- TypeScript compile error → regression in game-state.ts or trainer.service.ts types

## Not Proven By This UAT

- Mega form actually applies in battle (S03 scope)
- Animation modal plays before gym leader presentation (S04 scope)
- Stone persists across saves/reloads (depends on existing save mechanism, not S02)
- Live runtime wheel interaction tested in a real browser session

## Notes for Tester

- Check browser console for `[MegaStone]` log lines to confirm the award path was reached.
- The `altPrizeModal` being shown when no candidates exist is the expected fallback signal for gym battles.
- Multi-stone Pokémon resolution (Charizard → Charizardite X vs Y) is deterministic (first available); no randomness in stone selection, only in wheel spin for candidate selection.
