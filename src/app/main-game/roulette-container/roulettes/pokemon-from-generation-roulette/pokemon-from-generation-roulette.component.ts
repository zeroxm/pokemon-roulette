import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { pokemonByGeneration } from './pokemon-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-pokemon-from-generation-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './pokemon-from-generation-roulette.component.html',
  styleUrl: './pokemon-from-generation-roulette.component.css'
})
export class PokemonFromGenerationRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService, private pokemonService: PokemonService) {
  }

  pokemonByGeneration = pokemonByGeneration;

  generation!: GenerationItem;
  pokemon: PokemonItem[] = [];
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      const pokemonIds = this.pokemonByGeneration[this.generation.id] ?? [];
      this.pokemon = this.pokemonService.getPokemonByIdArray(pokemonIds);
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const selectedPokemon = this.pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
