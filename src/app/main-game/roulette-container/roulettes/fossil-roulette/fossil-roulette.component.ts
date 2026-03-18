import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fossilByGeneration } from './fossil-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-fossil-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './fossil-roulette.component.html',
  styleUrl: './fossil-roulette.component.css'
})
export class FossilRouletteComponent implements OnInit, OnDestroy {

  constructor(
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) {
  }

  fossilByGeneration = fossilByGeneration;

  generation!: GenerationItem;
  fossils: PokemonItem[] = [];
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();
  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      const fossilIds = this.fossilByGeneration[this.generation.id] ?? [];
      this.fossils = this.pokemonService.getPokemonByIdArray(fossilIds);
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const selectedPokemon = this.fossils[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
