# S03: Pre-Battle Mega Evolution Logic — UAT

**Milestone:** M001
**Written:** 2026-05-16T13:37:27.482Z

# S03: Pre-Battle Mega Evolution Logic — UAT

**Milestone:** M001
**Written:** 2025-07-15

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The core logic (form swap, revert, stone persistence, wheel gating) is implemented in TrainerService and RouletteContainerComponent. Build artifacts and symbol verification confirm integration. Live runtime verification (S04 animation modal) is deferred to the next slice.

## Preconditions

- App builds clean (ng build exit 0) ✓
- tsc --noEmit exit 0 ✓
- A save state with a mega-capable Pokémon on the team and its matching mega stone in trainerItems

## Smoke Test

Load a save with a Pokémon that holds a mega stone. Enter a battle. Confirm the Pokémon's power is 5 in the victory odds display and that a console.log line reads "Mega form applied: [PokémonName] → [MegaFormName]".

## Test Cases

### 1. Single stone holder auto-applies mega form

1. Start with exactly one mega-capable Pokémon on the team holding its stone.
2. Begin a battle.
3. **Expected:** applyMegaForms() fires; console.log shows mega form applied; that Pokémon appears as power = 5 in victory odds; trainerItems still contains the stone.

### 2. Multiple stone holders trigger selection wheel

1. Start with two or more mega-capable Pokémon on the team, each holding their stone.
2. Begin a battle.
3. **Expected:** select-mega-evolution wheel spins; player selects one Pokémon; only that Pokémon mega-evolves (power = 5); the other remains at base power; stone stays in inventory.

### 3. Battle exit reverts mega form

1. Complete or flee a battle after a mega evolution applied.
2. **Expected:** revertMegaForms() fires; console.log shows mega form reverted; Pokémon returns to its base form (original text/fillStyle/weight); megaBattleBaseId is cleared; stone remains in trainerItems.

### 4. Stone persists across battles

1. Win a battle with a mega evolution.
2. Check trainerItems.
3. **Expected:** The mega stone is still present; the Pokémon can mega-evolve again in the next battle.

## Edge Cases

### No stone holders — no wheel, no transformation

1. Start a battle with no mega-capable Pokémon holding a stone.
2. **Expected:** maybePushMegaSelectionBeforeBattle() is a no-op; no wheel appears; battle proceeds normally.

### Pokémon with mega form at power = 5

1. Confirm via calcVictoryOdds that the mega-evolved Pokémon contributes power = 5.
2. **Expected:** Odds are visibly higher when the mega form is active vs. base form.

## Failure Signals

- No console.log "Mega form applied" line after battle entry with a stone holder
- trainerItems missing the stone after a battle
- Pokémon still shows mega form name/stats after battle exit
- tsc or ng build errors introduced by S03 files

## Not Proven By This UAT

- S04 animation modal firing before the gym leader presentation (deferred to S04)
- Live browser rendering of the mega-selection wheel UI
- Edge case where Pokémon mega-evolves mid-run and stone was not awarded by S02 flow

## Notes for Tester

The mega-selection wheel reuses the existing PokemonFromAuxListRouletteComponent and the select-from-pokemon-list flow — if the wheel appears visually broken, check auxPokemonList population in RouletteContainerComponent. Console.log diagnostics in applyMegaForms() and revertMegaForms() are the fastest way to confirm the form swap pipeline is firing correctly.
