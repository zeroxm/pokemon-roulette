import { Component, EventEmitter, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { PokemonService } from '../../../services/pokemon-service/pokemon.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-mysterious-egg-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './mysterious-egg-roulette.component.html',
  styleUrl: './mysterious-egg-roulette.component.css'
})
export class MysteriousEggRouletteComponent {

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
