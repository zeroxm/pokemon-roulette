import { Component, EventEmitter, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-trade-pokemon-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './trade-pokemon-roulette.component.html',
  styleUrl: './trade-pokemon-roulette.component.css'
})
export class TradePokemonRouletteComponent {

  constructor(pokemonService: PokemonService) {
    this.nationalDexPokemon = pokemonService.getAllPokemon();
  }

  nationalDexPokemon: PokemonItem[];

  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    const selectedPokemon = this.nationalDexPokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }
}
