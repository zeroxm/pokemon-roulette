import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * The Gigantamax cinematic.
 *
 * A separate component from the mega one rather than a recolour of it, for two reasons. The beats
 * are different: a mega is a shell cracking to reveal a new form, a Gigantamax is red energy
 * pouring up from below and the Pokemon swelling to fill the screen. And
 * `mega-evolution-animation-modal.component.css` is already 8.52 kB against a 9 kB per-component
 * warning budget, so there was no room to add phases to it.
 *
 * Like the mega modal, this uses no translatable copy: it is visuals only, so a new locale needs
 * nothing here.
 */
type AnimationPhase = 'prelude' | 'charge' | 'cover' | 'vanish' | 'reveal' | 'settle';

interface EnergyMote {
  readonly id: number;
  readonly offsetX: number;
  readonly delayMs: number;
  readonly durationMs: number;
  readonly sizePx: number;
}

@Component({
  selector: 'app-gigantamax-animation-modal',
  imports: [CommonModule],
  templateUrl: './gigantamax-animation-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gigantamax-animation-modal.component.css'
})
export class GigantamaxAnimationModalComponent implements OnInit, OnDestroy {

  /** The form the player brought into the fight. */
  @Input() pokemonId!: number;
  /** The Gigantamax form. Falls back to the base so a missing id shows something rather than 404s. */
  @Input() gmaxPokemonId: number | null = null;

  readonly artworkBaseUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

  /** Local, unlike the sprites: it is part of the cinematic rather than Pokemon data. */
  readonly pokeballUrl = './PokeballDynamax.webp';

  currentPhase: AnimationPhase = 'prelude';
  motes: EnergyMote[] = [];

  private readonly timers: number[] = [];

  /**
   * The beats, in order: the Pokemon as it is, energy gathering under it, the ball dropping over
   * it, the ball bursting away to leave a silhouette, and the silhouette swelling back into
   * colour at size.
   *
   * The sprite swap and the darkening both happen *behind* the ball during `cover`, which is what
   * the ball is for. A species with no Gigantamax form swaps to itself, so the same beats play for
   * a plain Dynamax and only the growing is the payoff.
   *
   * Slower than the mega cinematic on purpose: the beat here is a swell, and a swell that
   * finishes quickly reads as a jump cut.
   */
  private readonly timeline: Array<{ phase: AnimationPhase; atMs: number }> = [
    { phase: 'prelude', atMs: 0 },
    { phase: 'charge', atMs: 420 },
    { phase: 'cover', atMs: 1150 },
    { phase: 'vanish', atMs: 2050 },
    { phase: 'reveal', atMs: 2560 },
    { phase: 'settle', atMs: 3700 }
  ];
  private readonly animationCloseMs = 4820;

  constructor(public activeModal: NgbActiveModal) {}

  get baseSpriteUrl(): string {
    return `${this.artworkBaseUrl}/${this.pokemonId}.png`;
  }

  get gmaxSpriteUrl(): string {
    return `${this.artworkBaseUrl}/${this.gmaxPokemonId ?? this.pokemonId}.png`;
  }

  ngOnInit(): void {
    this.motes = this.buildMotes(18);

    // The same 500ms lead-in the mega modal uses: the modal is still fading in before that, and
    // starting on frame one means the first beat is never seen.
    const animationDelayMs = 500;

    for (const step of this.timeline) {
      this.schedule(() => {
        this.currentPhase = step.phase;
      }, step.atMs + animationDelayMs);
    }

    this.schedule(() => {
      this.activeModal.close();
    }, this.animationCloseMs + animationDelayMs);
  }

  ngOnDestroy(): void {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
    }
    this.timers.length = 0;
  }

  trackMote(_: number, mote: EnergyMote): number {
    return mote.id;
  }

  private schedule(callback: () => void, delayMs: number): void {
    this.timers.push(window.setTimeout(callback, delayMs));
  }

  /** Motes rise from the floor of the frame, which is where Dynamax energy comes from. */
  private buildMotes(count: number): EnergyMote[] {
    const motes: EnergyMote[] = [];

    for (let i = 0; i < count; i++) {
      motes.push({
        id: i,
        offsetX: this.randomInRange(-180, 180),
        delayMs: i * 46,
        durationMs: 900 + (i % 5) * 110,
        sizePx: 6 + (i % 4) * 4
      });
    }

    return motes;
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
