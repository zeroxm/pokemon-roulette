import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { GenerationItem } from '../../../interfaces/generation-item';
import { WheelComponent } from "../../../wheel/wheel.component";
import { pokemonByGeneration } from './pokemon-by-generation';
import { GenerationService } from '../../../services/generation-service/generation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pokemon-from-generation-roulette',
  imports: [WheelComponent],
  templateUrl: './pokemon-from-generation-roulette.component.html',
  styleUrl: './pokemon-from-generation-roulette.component.css'
})
export class PokemonFromGenerationRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) {
  }

  pokemonByGeneration = pokemonByGeneration;

  generation!: GenerationItem;
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
    return this.pokemonByGeneration[this.generation.id];
  }
}