---
estimated_steps: 31
estimated_files: 3
skills_used: []
---

# T01: Create MegaEvolutionAnimationModalComponent with CSS keyframe animation

Why: R005 requires the cinematic animation (sphere → crack → reveal → icon dissolve) as a standalone Angular component opened as a modal. This task creates the component and all its CSS animation phases.

Do:
1. Generate the component directory: src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/
2. Create mega-evolution-animation-modal.component.ts as a standalone component. It must:
   - Inject NgbActiveModal
   - Accept @Input() pokemonId: number (the mega-evolved Pokémon's base ID — used to load the official-artwork sprite URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`)
   - Have a currentPhase: 'sphere' | 'crack' | 'reveal' | 'dissolve' = 'sphere' property
   - On ngOnInit, start the animation sequence using setTimeout chains:
     - 0ms: phase = 'sphere' (opalescent expanding orb covers sprite)
     - 800ms: phase = 'crack' (cracks radiate on orb surface)
     - 1600ms: phase = 'reveal' (orb shatters, mega sprite fades in)
     - 2400ms: phase = 'dissolve' (Mega Evolution M-icon fades in then out)
     - 3400ms: call this.activeModal.close() to release the queue
   - Include console.log('[MegaAnim] Opening for pokemonId', pokemonId) in ngOnInit
   - Include console.log('[MegaAnim] Phase:', phase) on each transition
   - Include console.log('[MegaAnim] Animation complete') before activeModal.close()
3. Create mega-evolution-animation-modal.component.html:
   - Outer container div.mega-anim-container [class]="currentPhase"
   - Inner div.mega-sprite with img bound to the official-artwork URL
   - div.mega-sphere (the opalescent orb, absolutely positioned)
   - div.mega-icon (the M-mark symbol, shown during dissolve phase)
   - No NgbModal dismiss button — modal is auto-dismissed by the animation
4. Create mega-evolution-animation-modal.component.css with @keyframes:
   - @keyframes sphereExpand: scale(0) → scale(1.5) with radial-gradient opalescent fill (rgba whites/blues/purples)
   - @keyframes crackAppear: opacity 0 → 1 with CSS filter hue-rotate for crack shimmer effect
   - @keyframes spriteReveal: opacity 0 → 1 with scale(0.8) → scale(1)
   - @keyframes iconPulse: opacity 0 → 1 → 0 with scale(1) → scale(1.2) → scale(0)
   - Phase classes control which @keyframes apply (e.g. .sphere .mega-sphere { animation: sphereExpand 0.7s ease-out forwards })
   - Container uses position: relative; min-height: 300px; display: flex; align-items: center; justify-content: center; background: #000;
   - Mega icon: large M text styled with gold gradient or use a unicode symbol ⟳ / custom text 'MEGA'

Done when: file exists, tsc --noEmit passes for the new files in isolation (verified in T03).

## Inputs

- `src/app/pokedex/pokedex-detail-modal/pokedex-detail-modal.component.ts`
- `src/app/services/modal-queue-service/modal-queue.service.ts`

## Expected Output

- `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts`
- `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.html`
- `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.css`

## Verification

grep -q 'NgbActiveModal' src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.ts

## Observability Impact

console.log('[MegaAnim] Opening for pokemonId', pokemonId) on open; '[MegaAnim] Phase: <phase>' on each transition; '[MegaAnim] Animation complete' before close
