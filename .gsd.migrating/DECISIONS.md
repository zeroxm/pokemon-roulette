# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 |  | architecture | How Mega Evolution forms are stored and applied | Extend existing temporaryBattleForms / applyBattleForms / revertBattleForms pattern in TrainerService, conditioned on stone possession in trainerItems | The Palafin pattern already handles temporary battle-entry swaps cleanly. Extending it avoids a parallel system and keeps form management in one place. | Yes | collaborative |
| D002 |  | architecture | How mega stones are represented in the item system | Each mega stone is a distinct ItemName literal and ItemItem record in the existing items infrastructure; stone possession is checked via trainerService.hasItem(stoneName) | Reuses existing add/remove/hasItem/getItem API with no new data structures. Stone uniqueness enforced by hasItem guard before awarding. | Yes | agent |
| D003 |  | architecture | How the Mega Evolution animation is delivered | Standalone Angular component with CSS keyframe animations (sphere, crack, reveal, icon-dissolve stages), opened via ModalQueueService before the leader presentation modal | No canvas needed — CSS transforms/keyframes are sufficient and consistent with the existing style stack. ModalQueueService ensures correct sequencing relative to leader modal. | Yes | agent |
| D004 |  | architecture | How the Mega Evolution animation modal is sequenced relative to the leader presentation modal | ModalQueueService.open(MegaEvolutionAnimationModalComponent) called before ModalQueueService.open(presentationModal) in each battle component's onGameStateChange; the modal self-closes via NgbActiveModal.close() at the end of the animation sequence, which unblocks the queue for the presentation modal | ModalQueueService is already used by gym and elite-four for sequencing; prepending the animation modal into the same queue guarantees correct ordering without any additional coordination mechanism. The modal's backdrop:static + keyboard:false prevents accidental dismissal mid-animation. | Yes | agent |
