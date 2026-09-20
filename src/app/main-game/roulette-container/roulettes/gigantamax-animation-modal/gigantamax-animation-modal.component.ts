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
type AnimationPhase = 'prelude' | 'charge' | 'beam' | 'swell' | 'reveal' | 'settle';

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

  currentPhase: AnimationPhase = 'prelude';
  motes: EnergyMote[] = [];

  private readonly timers: number[] = [];

  /**
   * Slower than the mega cinematic on purpose: the beat here is a swell, and a swell that finishes
   * quickly reads as a jump cut.
   */
  private readonly timeline: Array<{ phase: AnimationPhase; atMs: number }> = [
    { phase: 'prelude', atMs: 0 },
    { phase: 'charge', atMs: 380 },
    { phase: 'beam', atMs: 1100 },
    { phase: 'swell', atMs: 1780 },
    { phase: 'reveal', atMs: 2600 },
    { phase: 'settle', atMs: 3400 }
  ];
  private readonly animationCloseMs = 4480;

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
