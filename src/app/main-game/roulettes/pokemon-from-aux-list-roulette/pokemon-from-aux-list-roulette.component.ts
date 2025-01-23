import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { WheelComponent } from "../../../wheel/wheel.component";

@Component({
  selector: 'app-pokemon-from-aux-list-roulette',
  imports: [WheelComponent],
  templateUrl: './pokemon-from-aux-list-roulette.component.html',
  styleUrl: './pokemon-from-aux-list-roulette.component.css'
})
export class PokemonFromAuxListRouletteComponent {

  @Input() wheelTitle: String = "Which Pokémon?";
  @Input() trainerTeam!: PokemonItem[];
  @Output() selectedMemberEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    this.selectedMemberEvent.emit(this.trainerTeam[index]);
  }
}
