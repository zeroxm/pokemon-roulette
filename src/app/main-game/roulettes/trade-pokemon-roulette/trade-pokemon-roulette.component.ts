import { Component, EventEmitter, Output } from '@angular/core';
import { nationalDexPokemon } from '../../../game-data/national-dex-pokemon';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { WheelComponent } from "../../../wheel/wheel.component";

@Component({
  selector: 'app-trade-pokemon-roulette',
  imports: [WheelComponent],
  templateUrl: './trade-pokemon-roulette.component.html',
  styleUrl: './trade-pokemon-roulette.component.css'
})
export class TradePokemonRouletteComponent {

  nationalDexPokemon = nationalDexPokemon;

  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const selectedPokemon = this.nationalDexPokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
