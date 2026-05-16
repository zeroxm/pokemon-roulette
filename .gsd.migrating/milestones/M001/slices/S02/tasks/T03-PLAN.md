---
estimated_steps: 11
estimated_files: 4
skills_used: []
---

# T03: Build verification and smoke-test the full award flow

Why: The executor must confirm the feature compiles cleanly through AOT and that the award logic is reachable. Since Karma/Jasmine has a pre-existing ETIMEDOUT issue on Windows, verification is done via tsc + ng build (same proof as S01 T03).

Do:
1. Run `npx tsc --noEmit --project tsconfig.app.json` — must exit 0.
2. Run `ng build --project pokemon-roulette` — must exit 0 with 0 errors.
3. Grep sanity checks:
   - `grep -q 'award-mega-stone' src/app/services/game-state-service/game-state.ts`
   - `grep -q 'getMegaStoneEligiblePokemon' src/app/services/trainer-service/trainer.service.ts`
   - `grep -q 'awardMegaStone' src/app/main-game/roulette-container/roulette-container.component.ts`
   - `grep -q 'megaStone' src/assets/i18n/en.json`
4. If any step fails: fix the error before marking done.

Done when: tsc exits 0, ng build exits 0, all four grep checks pass.

## Inputs

- `src/app/services/game-state-service/game-state.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts`
- `src/assets/i18n/en.json`

## Expected Output

- Update the implementation and proof artifacts needed for this task.

## Verification

ng build --project pokemon-roulette

## Observability Impact

none — build verification only
