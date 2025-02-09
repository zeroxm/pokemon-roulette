import { Component, EventEmitter, Output } from '@angular/core';
import { WheelItem } from '../../../interfaces/wheel-item';
import { WheelComponent } from "../../../wheel/wheel.component";

@Component({
  selector: 'app-start-adventure-roulette',
  imports: [WheelComponent],
  templateUrl: './start-adventure-roulette.component.html',
  styleUrl: './start-adventure-roulette.component.css'
})
export class StartAdventureRouletteComponent {

  @Output () catchPokemonEvent = new EventEmitter<void>();
  @Output () battleTrainerEvent = new EventEmitter<void>();
  @Output () buyPotionsEvent = new EventEmitter<void>();
  @Output () doNothingEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'Catch a Pokémon', fillStyle: 'crimson', weight: 2 },
    { text: 'Battle Trainer', fillStyle: 'darkorange', weight: 2 },
    { text: 'Buy Potions', fillStyle: 'green', weight: 2 },
    { text: 'Go Straight', fillStyle: 'darkcyan', weight: 1 }
  ];

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.catchPokemonEvent.emit();        
        break;
      case 1:
        this.battleTrainerEvent.emit();
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
