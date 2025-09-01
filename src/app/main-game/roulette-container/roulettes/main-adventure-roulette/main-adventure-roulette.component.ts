import { Component, EventEmitter, Input, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-main-adventure-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './main-adventure-roulette.component.html',
  styleUrl: './main-adventure-roulette.component.css'
})
export class MainAdventureRouletteComponent {

  @Input() respinReason!: string;
  @Output() catchPokemonEvent = new EventEmitter<void>();
  @Output() battleTrainerEvent = new EventEmitter<EventSource>();
  @Output() buyPotionsEvent = new EventEmitter<void>();
  @Output() doNothingEvent = new EventEmitter<void>();
  @Output() catchTwoPokemonEvent = new EventEmitter<void>();
  @Output() visitDaycareEvent = new EventEmitter<EventSource>();
  @Output() teamRocketEncounterEvent = new EventEmitter<void>();
  @Output() mysteriousEggEvent = new EventEmitter<void>();
  @Output() legendaryEncounterEvent = new EventEmitter<void>();
  @Output() tradePokemonEvent = new EventEmitter<void>();
  @Output() findItemEvent = new EventEmitter<void>();
  @Output() exploreCaveEvent = new EventEmitter<void>();
  @Output() snorlaxEncounterEvent = new EventEmitter<void>();
  @Output() multitaskEvent = new EventEmitter<void>();
  @Output() goFishingEvent = new EventEmitter<void>();
  @Output() findFossilEvent = new EventEmitter<void>();
  @Output() battleRivalEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'Catch a Pokémon', fillStyle: 'crimson', weight: 3 },
    { text: 'Battle Trainer', fillStyle: 'darkorange', weight: 1 },
    { text: 'Buy Potions', fillStyle: 'darkgoldenrod', weight: 1 },
    { text: 'Go Straight', fillStyle: 'green', weight: 1 },
    { text: 'Catch two Pokémon', fillStyle: 'darkcyan', weight: 1 },
    { text: 'Visit the Daycare', fillStyle: 'blue', weight: 1 },
    { text: 'Team Rocket Encounter', fillStyle: 'purple', weight: 1 },
    { text: 'Mysterious Egg', fillStyle: 'deeppink', weight: 1 },
    { text: 'Legendary Encounter', fillStyle: 'crimson', weight: 1 },
    { text: 'Trade Pokémon', fillStyle: 'darkorange', weight: 1 },
    { text: 'Find an Item', fillStyle: 'darkgoldenrod', weight: 1 },
    { text: 'Explore a Cave', fillStyle: 'green', weight: 1 },
    { text: 'Snorlax Encounter', fillStyle: 'darkcyan', weight: 1 },
    { text: 'Multitask (Spin2x)', fillStyle: 'blue', weight: 1 },
    { text: 'Go Fishing', fillStyle: 'purple', weight: 1 },
    { text: 'Find a Fossil', fillStyle: 'deeppink', weight: 1 },
    { text: 'Battle Rival', fillStyle: 'black', weight: 1 },
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
      case 4:
        this.catchTwoPokemonEvent.emit();
        break;
      case 5:
        this.visitDaycareEvent.emit('visit-daycare');
        break;
      case 6:
        this.teamRocketEncounterEvent.emit();
        break;
      case 7:
        this.mysteriousEggEvent.emit();
        break;
      case 8:
        this.legendaryEncounterEvent.emit();
        break;
      case 9:
        this.tradePokemonEvent.emit();
        break;
      case 10:
        this.findItemEvent.emit();
        break;
      case 11:
        this.exploreCaveEvent.emit();
        break;
      case 12:
        this.snorlaxEncounterEvent.emit();
        break;
      case 13:
        this.multitaskEvent.emit();
        break;
      case 14:
        this.goFishingEvent.emit();
        break;
      case 15:
        this.findFossilEvent.emit();
        break;
      case 16:
        this.battleRivalEvent.emit();
        break;
    }
  }
}

