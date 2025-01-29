import { Component, EventEmitter, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { WheelItem } from '../../../interfaces/wheel-item';

@Component({
  selector: 'app-main-adventure-roulette',
  imports: [WheelComponent],
  templateUrl: './main-adventure-roulette.component.html',
  styleUrl: './main-adventure-roulette.component.css'
})
export class MainAdventureRouletteComponent {
  @Output() catchPokemonEvent = new EventEmitter<void>();
  @Output() battleTrainerEvent = new EventEmitter<void>();
  @Output() buyPotionsEvent = new EventEmitter<void>();
  @Output() doNothingEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'Battle Trainer', fillStyle: 'darkorange', weight: 1 },
    { text: 'Catch a Pokémon', fillStyle: 'crimson', weight: 1 },
    { text: 'Buy Potions', fillStyle: 'green', weight: 1 },
    { text: 'Do Nothing', fillStyle: 'darkcyan', weight: 1 }
  ];

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.battleTrainerEvent.emit();
        break;
      case 1:
        this.catchPokemonEvent.emit();        
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
