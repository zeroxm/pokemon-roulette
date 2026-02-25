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
    { text: 'game.main.roulette.adventure.actions.catchPokemon', fillStyle: 'crimson', weight: 3 },
    { text: 'game.main.roulette.adventure.actions.battleTrainer', fillStyle: 'darkorange', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.buyPotions', fillStyle: 'darkgoldenrod', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.goStraight', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.catchTwoPokemon', fillStyle: 'darkcyan', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.visitDaycare', fillStyle: 'blue', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.teamRocket', fillStyle: 'purple', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.mysteriousEgg', fillStyle: 'deeppink', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.legendaryEncounter', fillStyle: 'crimson', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.tradePokemon', fillStyle: 'darkorange', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.findItem', fillStyle: 'darkgoldenrod', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.exploreCave', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.snorlaxEncounter', fillStyle: 'darkcyan', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.multitask', fillStyle: 'blue', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.goFishing', fillStyle: 'purple', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.findFossil', fillStyle: 'deeppink', weight: 1 },
    { text: 'game.main.roulette.adventure.actions.battleRival', fillStyle: 'black', weight: 1 },
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

