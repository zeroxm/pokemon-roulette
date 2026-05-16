# S04: Mega Evolution Animation Modal

**Goal:** Build a cinematic Mega Evolution animation modal (opalescent sphere → crack → reveal → icon dissolve) and wire it to fire via ModalQueueService before the gym leader, Elite Four, and Champion presentation modals whenever a Pokémon mega-evolved this battle.
**Demo:** After this: entering a battle with a mega-capable Pokémon triggers the full animation sequence in a modal before the gym leader / elite four / champion presentation appears.

## Must-Haves

- MegaEvolutionAnimationModalComponent exists with 4-phase CSS keyframe animation
- All three battle components (gym, elite-four, champion) open the animation modal before their presentation modal when megaBattleBaseId is set
- TrainerService exposes getMegaBattleBaseId() public getter
- tsc --noEmit exits 0, ng build exits 0 (warnings only)
- Animation modal self-closes after completion and unblocks the queued presentation modal

## Proof Level

- This slice proves: integration — tsc + ng build clean; symbol greps confirm wiring; UAT (visual animation) deferred to human review

## Integration Closure

Upstream: TrainerService.megaBattleBaseId (set by S03 maybePushMegaSelectionBeforeBattle flow), ModalQueueService.open() queue, gym/elite-four/champion onGameStateChange hooks. New wiring: MegaEvolutionAnimationModalComponent opened via ModalQueueService in each battle component's onGameStateChange before the leader presentation modal. What remains: nothing — this is the final slice of M001.

## Verification

- console.log on animation modal open (pokemonId) and on animation completion (phase name). NgbActiveModal.close() called programmatically after final CSS animation phase ends — future agent can inspect by searching for [MegaAnim] prefix in browser console.

## Tasks

- [x] **T01: Create MegaEvolutionAnimationModalComponent with CSS keyframe animation** `est:1h`
  Why: R005 requires the cinematic animation (sphere → crack → reveal → icon dissolve) as a standalone Angular component opened as a modal. This task creates the component and all its CSS animation phases.
  - Files: `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts`, `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.html`, `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.css`
  - Verify: grep -q 'NgbActiveModal' src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts

- [ ] **T02: Add getMegaBattleBaseId() to TrainerService and wire animation modal into all three battle components** `est:45m`
  Why: R003 requires the animation to block the leader/elite/champion presentation modal via ModalQueueService. The three battle components each call modalQueueService.open(presentationModal) in onGameStateChange; this task prepends a conditional animation modal open before that call when megaBattleBaseId is set.
  - Files: `src/app/services/trainer-service/trainer.service.ts`, `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts`, `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`, `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`, `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts`
  - Verify: grep -q 'getMegaBattleBaseId' src/app/services/trainer-service/trainer.service.ts

- [ ] **T03: Add i18n keys and run full build verification** `est:30m`
  Why: The animation modal may display translated text (e.g. 'Mega Evolution!' header or phase labels). Build verification confirms no TypeScript errors were introduced across the full S04 change set.
  - Files: `src/assets/i18n/en.json`, `src/assets/i18n/es.json`, `src/assets/i18n/de.json`, `src/assets/i18n/fr.json`, `src/assets/i18n/it.json`, `src/assets/i18n/pt.json`
  - Verify: grep -q 'getMegaBattleBaseId' src/app/services/trainer-service/trainer.service.ts

## Files Likely Touched

- src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts
- src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.html
- src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.css
- src/app/services/trainer-service/trainer.service.ts
- src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts
- src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts
- src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts
- src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts
- src/assets/i18n/en.json
- src/assets/i18n/es.json
- src/assets/i18n/de.json
- src/assets/i18n/fr.json
- src/assets/i18n/it.json
- src/assets/i18n/pt.json
