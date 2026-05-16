---
estimated_steps: 11
estimated_files: 3
skills_used: []
---

# T03: Build verification — tsc and ng build pass clean

Why: AOT compilation catches template type errors that tsc --noEmit misses. This task confirms S03 changes compile end-to-end without introducing errors.

Do:
1. Run `npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json` — must exit 0.
2. Run `ng build --project pokemon-roulette` — must exit 0 with 0 errors (pre-existing budget/CommonJS warnings are acceptable).
3. Run targeted greps to confirm key symbols are present:
   - `grep -q 'getMegaBattleCandidates' src/app/services/trainer-service/trainer.service.ts`
   - `grep -q 'select-mega-evolution' src/app/services/game-state-service/game-state.ts`
   - `grep -q 'applyMegaForms' src/app/services/trainer-service/trainer.service.ts`
   - `grep -q 'revertMegaForms' src/app/services/trainer-service/trainer.service.ts`
   - `grep -q 'select-mega-evolution' src/app/main-game/roulette-container/roulette-container.component.ts`

Done when: tsc exits 0; ng build exits 0; all 5 grep checks pass.

## Inputs

- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/services/game-state-service/game-state.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts`

## Expected Output

- Update the implementation and proof artifacts needed for this task.

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.json
