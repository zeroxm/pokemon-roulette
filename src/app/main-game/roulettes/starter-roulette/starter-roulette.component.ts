import { Component, EventEmitter, Input, Output } from '@angular/core';
import { starterByGeneration } from '../../../game-data/starter-by-generation';
import { WheelComponent } from '../../../wheel/wheel.component';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { GenerationItem } from '../../../interfaces/generation-item';

@Component({
  selector: 'app-starter-roulette',
  imports: [WheelComponent],
  templateUrl: './starter-roulette.component.html',
  styleUrl: './starter-roulette.component.css'
})
export class StarterRouletteComponent {

  startersByGeneration = starterByGeneration;

  @Input() generation!: GenerationItem;
  @Output() selectedStarterEvent = new EventEmitter<PokemonItem>();

  getStarters(): PokemonItem[] {
    return this.startersByGeneration[this.generation.id];
  }

  onItemSelected(index: number): void {
    const starters = this.getStarters();
    const selectedStarter = starters[index];
    this.selectedStarterEvent.emit(selectedStarter);
  }
}
