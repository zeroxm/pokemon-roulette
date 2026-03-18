import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { legendaryByGeneration } from './legendaries-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-legendary-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './legendary-roulette.component.html',
  styleUrl: './legendary-roulette.component.css'
})
export class LegendaryRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService, private pokemonService: PokemonService) {
  }

  legendaryByGeneration = legendaryByGeneration;

  generation!: GenerationItem;
  legendaries: PokemonItem[] = [];
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      const legendaryIds = this.legendaryByGeneration[this.generation.id] ?? [];
      this.legendaries = this.pokemonService.getPokemonByIdArray(legendaryIds);
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const selectedPokemon = this.legendaries[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
