import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

type AnimationPhase = 'sphere' | 'crack' | 'reveal' | 'dissolve';

@Component({
  selector: 'app-mega-evolution-animation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mega-evolution-animation-modal.component.html',
  styleUrl: './mega-evolution-animation-modal.component.css'
})
// i18n note: This component intentionally uses hardcoded strings ("MEGA") rather than
// TranslatePipe to avoid adding a translation dependency to a purely cinematic modal.
// If translations are needed later, add keys under game.main.roulette.mega.megaEvolution
// and game.main.roulette.mega.megaTitle in all six locale files, then import TranslateModule.
export class MegaEvolutionAnimationModalComponent implements OnInit {
  @Input() pokemonId!: number;

  currentPhase: AnimationPhase = 'sphere';

  readonly artworkBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

  get spriteUrl(): string {
    return `${this.artworkBaseUrl}/${this.pokemonId}.png`;
  }

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    console.log('[MegaAnim] Opening for pokemonId', this.pokemonId);

    this.setPhase('sphere', 0);
    this.setPhase('crack', 800);
    this.setPhase('reveal', 1600);
    this.setPhase('dissolve', 2400);

    setTimeout(() => {
      console.log('[MegaAnim] Animation complete');
      this.activeModal.close();
    }, 3400);
  }

  private setPhase(phase: AnimationPhase, delay: number): void {
    setTimeout(() => {
      this.currentPhase = phase;
      console.log('[MegaAnim] Phase:', phase);
    }, delay);
  }
}
