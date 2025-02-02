import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { GenerationItem } from '../../../interfaces/generation-item';
import { PokemonItem } from '../../../interfaces/pokemon-item';

@Component({
  selector: 'app-cave-pokemon-roulette',
  imports: [WheelComponent],
  templateUrl: './cave-pokemon-roulette.component.html',
  styleUrl: './cave-pokemon-roulette.component.css'
})
export class CavePokemonRouletteComponent {
  @Input() generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const pokemon = this.getFromGeneration();
    const selectedPokemon = pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return [];
    // return this.cavePokemonByGeneration[this.generation.id];
  }
}
