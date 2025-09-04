import { Component, EventEmitter, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-start-adventure-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './start-adventure-roulette.component.html',
  styleUrl: './start-adventure-roulette.component.css'
})
export class StartAdventureRouletteComponent {

  @Output () catchPokemonEvent = new EventEmitter<void>();
  @Output () battleTrainerEvent = new EventEmitter<EventSource>();
  @Output () buyPotionsEvent = new EventEmitter<void>();
  @Output () doNothingEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'game.main.roulette.start.actions.catchPokemon', fillStyle: 'crimson', weight: 2 },
    { text: 'game.main.roulette.start.actions.battleTrainer', fillStyle: 'darkorange', weight: 2 },
    { text: 'game.main.roulette.start.actions.buyPotions', fillStyle: 'green', weight: 2 },
    { text: 'game.main.roulette.start.actions.goStraight', fillStyle: 'darkcyan', weight: 1 }
  ];

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.catchPokemonEvent.emit();
        break;
      case 1:
        this.battleTrainerEvent.emit('battle-trainer');
        break;
      case 2:
        this.buyPotionsEvent.emit();
        break;
      case 3:
        this.doNothingEvent.emit();
        break;
    }
  }
}
