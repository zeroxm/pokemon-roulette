import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

type AnimationPhase = 'prelude' | 'gather' | 'expand' | 'crack' | 'reveal' | 'dissolve';

interface ParticleConfig {
  id: number;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  delayMs: number;
  durationMs: number;
  sizePx: number;
}

@Component({
  selector: 'app-mega-evolution-animation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mega-evolution-animation-modal.component.html',
  styleUrl: './mega-evolution-animation-modal.component.css'
})
// i18n note: This cinematic uses no translatable copy and relies on visual assets only.
// If text is introduced later, add translation keys and import TranslateModule.
export class MegaEvolutionAnimationModalComponent implements OnInit, OnDestroy {
  @Input() pokemonId!: number;
  @Input() megaPokemonId: number | null = null;

  currentPhase: AnimationPhase = 'prelude';
  particles: ParticleConfig[] = [];
  private readonly timers: number[] = [];

  readonly artworkBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  readonly megaSymbolUrl = '/Mega_Evolution_symbol.png';
  private readonly timeline: Array<{ phase: AnimationPhase; atMs: number }> = [
    { phase: 'prelude', atMs: 0 },
    { phase: 'gather', atMs: 420 },
    { phase: 'expand', atMs: 1220 },
    { phase: 'crack', atMs: 1960 },
    { phase: 'reveal', atMs: 2500 },
    { phase: 'dissolve', atMs: 3120 }
  ];
  private readonly animationCloseMs = 4240;

  get baseSpriteUrl(): string {
    return `${this.artworkBaseUrl}/${this.pokemonId}.png`;
  }

  get megaSpriteUrl(): string {
    const resolvedMegaId = this.megaPokemonId ?? this.pokemonId;
    return `${this.artworkBaseUrl}/${resolvedMegaId}.png`;
  }

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.particles = this.buildParticles(20);
    // Delay animation start by 500ms
    const animationDelayMs = 500;

    // Schedule animation phases with 500ms delay
    for (const step of this.timeline) {
      this.schedule(() => {
        this.currentPhase = step.phase;
      }, step.atMs + animationDelayMs);
    }

    // Close modal after animation completes + delay
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

  trackParticle(_: number, particle: ParticleConfig): number {
    return particle.id;
  }

  private schedule(callback: () => void, delayMs: number): void {
    const timerId = window.setTimeout(callback, delayMs);
    this.timers.push(timerId);
  }

  private buildParticles(count: number): ParticleConfig[] {
    const particles: ParticleConfig[] = [];

    for (let i = 0; i < count; i++) {
      const startX = this.randomInRange(-220, 220);
      const startY = this.randomInRange(-165, 165);
      const midX = startX * this.randomInRange(0.2, 0.5) + this.randomInRange(-58, 58);
      const midY = startY * this.randomInRange(0.2, 0.5) + this.randomInRange(-58, 58);

      particles.push({
        id: i,
        startX,
        startY,
        midX,
        midY,
        delayMs: i * 52,
        durationMs: 620 + (i % 4) * 92,
        sizePx: 7 + (i % 3) * 3
      });
    }

    return particles;
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
