import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { GenerationItem } from '../../../interfaces/generation-item';
import { WheelComponent } from "../../../wheel/wheel.component";
import { pokemonByGeneration } from './pokemon-by-generation';

@Component({
  selector: 'app-pokemon-from-generation-roulette',
  imports: [WheelComponent],
  templateUrl: './pokemon-from-generation-roulette.component.html',
  styleUrl: './pokemon-from-generation-roulette.component.css'
})
export class PokemonFromGenerationRouletteComponent {

  pokemonByGeneration = pokemonByGeneration;

  @Input() generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const pokemon = this.getFromGeneration();
    const selectedPokemon = pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.pokemonByGeneration[this.generation.id];
  }
}