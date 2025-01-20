import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelComponent } from '../wheel/wheel.component';
import { starterByGeneration } from './starter-by-generation';
import { PokemonItem } from '../main-game/main-game.component';

@Component({
  selector: 'app-starter-roulette',
  imports: [WheelComponent],
  templateUrl: './starter-roulette.component.html',
  styleUrl: './starter-roulette.component.css'
})
export class StarterRouletteComponent {

  startersByGeneration = starterByGeneration;

  selectedStarter!: PokemonItem;

  @Input() generation!: number;
  @Output() selectedStarterEvent = new EventEmitter<PokemonItem>();

  getStarters(): PokemonItem[] {
    return this.startersByGeneration[this.generation];
  }

  onItemSelected(index: number): void {
    const starters = this.getStarters();
    this.selectedStarter = starters[index];
    this.selectedStarterEvent.emit(this.selectedStarter);
  }
}
