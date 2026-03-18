import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fishByGeneration } from './fish-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-fishing-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './fishing-roulette.component.html',
  styleUrl: './fishing-roulette.component.css'
})
export class FishingRouletteComponent {

  constructor(
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) {
  }

  fishByGeneration = fishByGeneration;

  generation!: GenerationItem;
  fish: PokemonItem[] = [];
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();
  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      const fishIds = this.fishByGeneration[this.generation.id] ?? [];
      this.fish = this.pokemonService.getPokemonByIdArray(fishIds);
    });
  }

  ngOnDestroy(): void {
      this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const selectedPokemon = this.fish[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
