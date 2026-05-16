---
estimated_steps: 16
estimated_files: 6
skills_used: []
---

# T03: Add i18n keys and run full build verification

Why: The animation modal may display translated text (e.g. 'Mega Evolution!' header or phase labels). Build verification confirms no TypeScript errors were introduced across the full S04 change set.

Do:
1. Add i18n keys to all six locale files (en, es, de, fr, it, pt) under the existing game.main.roulette.mega namespace:
   - 'megaEvolution': 'Mega Evolution!' (en) — translate appropriately for each locale
   - 'megaTitle': 'It's Mega Evolving!' (en) — shown during reveal phase
   These keys are used by the animation modal HTML template (via TranslatePipe or direct string if TranslatePipe is not imported in the modal).
   If the modal uses hardcoded strings to avoid the TranslatePipe dependency, skip this step and leave a comment in the component explaining the choice.

2. Run tsc --noEmit and confirm exit 0.

3. Run ng build and confirm exit 0 (warnings permitted, errors not).

4. Run grep checks:
   - grep -q 'getMegaBattleBaseId' src/app/services/trainer-service/trainer.service.ts
   - grep -q 'MegaEvolutionAnimationModalComponent' src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts
   - grep -q 'MegaEvolutionAnimationModalComponent' src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts
   - grep -q 'MegaEvolutionAnimationModalComponent' src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts
   - grep -q 'NgbActiveModal' src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts

Done when: tsc exits 0, ng build exits 0, all 5 grep checks pass.

## Inputs

- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`
- `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts`
- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts`

## Expected Output

- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`

## Verification

grep -q 'getMegaBattleBaseId' src/app/services/trainer-service/trainer.service.ts

## Observability Impact

tsc and ng build exit codes are the primary health signal; grep checks confirm wiring is in place
