---
estimated_steps: 19
estimated_files: 5
skills_used: []
---

# T02: Add getMegaBattleBaseId() to TrainerService and wire animation modal into all three battle components

Why: R003 requires the animation to block the leader/elite/champion presentation modal via ModalQueueService. The three battle components each call modalQueueService.open(presentationModal) in onGameStateChange; this task prepends a conditional animation modal open before that call when megaBattleBaseId is set.

Do:
1. In TrainerService (trainer.service.ts), add a public getter:
   getMegaBattleBaseId(): number | null { return this.megaBattleBaseId; }
   Place it after setMegaBattlePokemon() for proximity.

2. In GymBattleRouletteComponent (gym-battle-roulette.component.ts):
   a. Import MegaEvolutionAnimationModalComponent
   b. In onGameStateChange, before the existing modalQueueService.open(gymLeaderPresentationModal) call, add:
      const megaBaseId = this.trainerService.getMegaBattleBaseId();
      if (megaBaseId !== null) {
        const animRef = await this.modalQueueService.open(MegaEvolutionAnimationModalComponent, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });
        animRef.componentInstance.pokemonId = megaBaseId;
      }
   c. Make onGameStateChange async (returns Promise<void>) to use await; alternatively chain .then() without async if the method signature cannot change. Check BaseBattleRouletteComponent — onGameStateChange is abstract with return type void; change it to return void | Promise<void> so async override compiles. Adjust base class accordingly.

3. In EliteFourBattleRouletteComponent (elite-four-battle-roulette.component.ts):
   Same pattern as gym: import, make async, prepend animation modal before eliteFourPresentationModal.

4. In ChampionBattleRouletteComponent (champion-battle-roulette.component.ts):
   Same pattern. Note: champion uses this.modalService (NgbModal) not modalQueueService for its presentation. For the animation modal, inject and use ModalQueueService (or use modalService.open() directly since champion already uses NgbModal). Prefer injecting ModalQueueService in champion to keep sequencing consistent. If ModalQueueService is not already injected in champion, add it.

Done when: getMegaBattleBaseId is public on TrainerService; all three battle components import and conditionally open MegaEvolutionAnimationModalComponent; tsc --noEmit passes (verified in T03).

## Inputs

- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts`

## Expected Output

- `src/app/services/trainer-service/trainer.service.ts`
- `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts`

## Verification

grep -q 'getMegaBattleBaseId' src/app/services/trainer-service/trainer.service.ts

## Observability Impact

getMegaBattleBaseId() readable by any component for runtime inspection of which Pokémon is mega-evolving this battle
