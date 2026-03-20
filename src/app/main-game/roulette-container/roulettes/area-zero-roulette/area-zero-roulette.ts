import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { areaZeroParadoxPokemonIds } from './area-zero-pokemon';

@Component({
  selector: 'app-area-zero-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './area-zero-roulette.html',
  styleUrl: './area-zero-roulette.css',
})
export class AreaZeroRoulette {

  constructor(private pokemonService: PokemonService) {
    this.paradoxPokemon = this.pokemonService.getPokemonByIdArray(areaZeroParadoxPokemonIds);
  }

  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  paradoxPokemon: PokemonItem[] = [];

  onItemSelected(index: number): void {
    const selectedPokemon = this.paradoxPokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

}
