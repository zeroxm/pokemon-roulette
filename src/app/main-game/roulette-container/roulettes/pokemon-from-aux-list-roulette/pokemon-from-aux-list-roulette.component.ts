import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pokemon-from-aux-list-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './pokemon-from-aux-list-roulette.component.html',
  styleUrl: './pokemon-from-aux-list-roulette.component.css'
})
export class PokemonFromAuxListRouletteComponent {

  @Input() wheelTitle: string = "Which Pokémon?";
  @Input() trainerTeam!: PokemonItem[];
  @Output() selectedMemberEvent = new EventEmitter<PokemonItem>();

  onItemSelected(index: number): void {
    this.selectedMemberEvent.emit(this.trainerTeam[index]);
  }
}
