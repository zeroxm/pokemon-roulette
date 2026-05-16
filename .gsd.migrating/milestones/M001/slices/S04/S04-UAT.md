# S04: Mega Evolution Animation Modal — UAT

**Milestone:** M001
**Written:** 2026-05-16T14:15:31.805Z

# S04: Mega Evolution Animation Modal — UAT

**Milestone:** M001
**Written:** 2025-07-11

## UAT Type

- UAT mode: human-experience
- Why this mode is sufficient: The animation is a purely visual/cinematic feature. Symbol greps and build verification confirm wiring; actual animation quality and timing require a human in a running browser.

## Preconditions

1. App is running (`ng serve` or built and served).
2. A trainer save exists with at least one mega-capable Pokémon (e.g. Venusaur, Charizard, Blastoise, Gengar, Kangaskhan, etc.) in the party.
3. The trainer has the corresponding mega stone in their items (awarded by S02 logic after winning a prior battle).
4. A gym battle, Elite Four battle, or Champion battle is available to enter.

## Smoke Test

Enter a gym battle with Charizard + Charizardite X in inventory. Before the gym leader presentation modal appears, the Mega Evolution animation modal should open and play.

## Test Cases

### 1. Animation modal appears before gym leader presentation

1. Start a gym battle where your party includes a mega-capable Pokémon and you have the matching stone.
2. Win the battle.
3. **Expected:** A full-screen animation modal opens first — showing opalescent sphere → crack → reveal → icon dissolve over ~3.4 seconds — then closes automatically. The gym leader presentation modal opens immediately after.

### 2. Animation modal appears before Elite Four presentation

1. Enter an Elite Four battle under the same conditions.
2. Win the battle.
3. **Expected:** Same animation sequence fires before the Elite Four member's presentation modal.

### 3. Animation modal appears before Champion presentation

1. Enter the Champion battle under the same conditions.
2. Win the battle.
3. **Expected:** Same animation sequence fires before the Champion's presentation modal.

### 4. No animation when no mega stone present

1. Enter any battle with a mega-capable Pokémon but WITHOUT the matching stone in inventory.
2. Win the battle.
3. **Expected:** Animation modal does NOT appear. Presentation modal opens immediately as before.

### 5. Animation self-closes and unblocks queue

1. Trigger the animation (any battle with stone + capable Pokémon).
2. Do not interact — let it run.
3. **Expected:** Modal closes automatically after ~3.4 seconds. Presentation modal opens without requiring any user action.

## Edge Cases

### Multiple mega-capable Pokémon in party

1. Have two mega-capable Pokémon (e.g. Venusaur + Gengar) with both stones.
2. Enter and win a battle.
3. **Expected:** Animation plays once for the selected mega Pokémon (whichever TrainerService chose via S03 logic). Not twice.

### Browser console logging

1. Open DevTools console before triggering animation.
2. Win a battle with mega conditions met.
3. **Expected:** `[MegaAnim] Opening for pokemonId: <id>` logged on open; `[MegaAnim] Animation complete` (or similar) logged when final phase ends.

## Failure Signals

- Animation modal never appears → getMegaBattleBaseId() returning null/undefined despite stone being present; check S03 `maybePushMegaSelectionBeforeBattle` logic.
- Presentation modal never opens after animation → ModalQueueService queue stuck; animation modal may not be calling `NgbActiveModal.close()`.
- TypeScript errors on build → import or component declaration missing.
- Animation plays but phases look wrong → CSS keyframe timing values; inspect `.gsd/exec` logs for build errors.

## Not Proven By This UAT

- Animation visual quality, timing feel, or artistic merit — requires human aesthetic judgment.
- Correct Pokémon sprite shown in the animation (sprite asset availability is independent).
- i18n/translation of any text in the modal (hardcoded 'MEGA' string, translation deferred by design).
- Performance on low-end devices.

## Notes for Tester

The animation uses hardcoded 'MEGA' text rather than a translated string — this is intentional for the cinematic component. The upgrade path to TranslatePipe is documented in a comment in the component file. Focus gut-check on: does the animation feel dramatic and special, does it block the right modal, and does it self-dismiss cleanly.
