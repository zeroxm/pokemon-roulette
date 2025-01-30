import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { legendaryByGeneration } from '../../../game-data/legendaries-by-generation';
import { GenerationItem } from '../../../interfaces/generation-item';
import { PokemonItem } from '../../../interfaces/pokemon-item';

@Component({
  selector: 'app-legendary-roulette',
  imports: [WheelComponent],
  templateUrl: './legendary-roulette.component.html',
  styleUrl: './legendary-roulette.component.css'
})
export class LegendaryRouletteComponent {

  legendaryByGeneration = legendaryByGeneration;

  @Input() generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const legendary = this.getFromGeneration();
    const selectedPokemon = legendary[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.legendaryByGeneration[this.generation.id];
  }
}
