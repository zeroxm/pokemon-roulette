import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { GenerationService } from '../../../services/generation-service/generation.service';
import { fossilByGeneration } from './fossil-by-generation';
import { GenerationItem } from '../../../interfaces/generation-item';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fossil-roulette',
  imports: [WheelComponent],
  templateUrl: './fossil-roulette.component.html',
  styleUrl: './fossil-roulette.component.css'
})
export class FossilRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) {
  }

  fossilByGeneration = fossilByGeneration;

  @Input() generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();
  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });
  }

  ngOnDestroy(): void {
    if (this.generationSubscription) {
      this.generationSubscription.unsubscribe();
    }
  }

  onItemSelected(index: number): void {
    const pokemon = this.getFromGeneration();
    const selectedPokemon = pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.fossilByGeneration[this.generation.id];
  }
}
