import { Component, EventEmitter, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-explore-cave-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './explore-cave-roulette.component.html',
  styleUrl: './explore-cave-roulette.component.css'
})
export class ExploreCaveRouletteComponent {

  @Output() catchCavePokemonEvent = new EventEmitter<void>();
  @Output() battleTrainerEvent = new EventEmitter<EventSource>();
  @Output() findItemEvent = new EventEmitter<void>();
  @Output() getLostEvent = new EventEmitter<void>();
  @Output() catchZubatEvent = new EventEmitter<void>();
  @Output() findFossilEvent = new EventEmitter<void>();
  @Output() teamRocketEncounterEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'Catch cave Pokémon', fillStyle: 'crimson', weight: 1 },
    { text: 'Battle Trainer', fillStyle: 'darkorange', weight: 1 },
    { text: 'Find an Item', fillStyle: 'darkgoldenrod', weight: 1 },
    { text: 'Get Lost', fillStyle: 'green', weight: 1 },
    { text: 'Catch a Zubat', fillStyle: 'darkcyan', weight: 1 },
    { text: 'Find a Fossil', fillStyle: 'blue', weight: 1 },
    { text: 'Team Rocket', fillStyle: 'purple', weight: 1 },
  ];

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.catchCavePokemonEvent.emit();
        break;
      case 1:
        this.battleTrainerEvent.emit('battle-trainer');
        break;
      case 2:
        this.findItemEvent.emit();
        break;
      case 3:
        this.getLostEvent.emit();
        break;
      case 4:
        this.catchZubatEvent.emit();
        break;
      case 5:
        this.findFossilEvent.emit();
        break;
      case 6:
        this.teamRocketEncounterEvent.emit();
        break;
    }
  }
}
