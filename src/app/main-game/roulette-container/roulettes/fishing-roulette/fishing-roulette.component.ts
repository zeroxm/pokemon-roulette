import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fishByGeneration } from './fish-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-fishing-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './fishing-roulette.component.html',
  styleUrl: './fishing-roulette.component.css'
})
export class FishingRouletteComponent {

  constructor(private generationService: GenerationService) {
  }

  fishByGeneration = fishByGeneration;

  @Input() generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();
  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });
  }

  ngOnDestroy(): void {
      this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const pokemon = this.getFromGeneration();
    const selectedPokemon = pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.fishByGeneration[this.generation.id];
  }
}
