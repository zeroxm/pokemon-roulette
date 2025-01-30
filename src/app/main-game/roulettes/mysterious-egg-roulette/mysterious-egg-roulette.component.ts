import { Component, EventEmitter, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { nationalDexPokemon } from '../../../game-data/national-dex-pokemon';
import { PokemonItem } from '../../../interfaces/pokemon-item';

@Component({
  selector: 'app-mysterious-egg-roulette',
  imports: [WheelComponent],
  templateUrl: './mysterious-egg-roulette.component.html',
  styleUrl: './mysterious-egg-roulette.component.css'
})
export class MysteriousEggRouletteComponent {

  nationalDexPokemon = nationalDexPokemon;

  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const selectedPokemon = this.nationalDexPokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
