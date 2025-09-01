import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-elite-four-prep-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './elite-four-prep-roulette.component.html',
  styleUrl: './elite-four-prep-roulette.component.css'
})
export class EliteFourPrepRouletteComponent implements OnInit {

  constructor(private modalService: NgbModal) { }

  @ViewChild('victoryRoadModal', { static: true }) victoryRoadModal!: TemplateRef<any>;

  ngOnInit(): void {
    this.modalService.open(this.victoryRoadModal, {
      centered: true,
      size: 'lg'
    });
  }

  @Input() respinReason!: string;
  @Output() catchPokemonEvent = new EventEmitter<void>();
  @Output() battleTrainerEvent = new EventEmitter<EventSource>();
  @Output() buyPotionsEvent = new EventEmitter<void>();
  @Output() catchTwoPokemonEvent = new EventEmitter<void>();
  @Output() legendaryEncounterEvent = new EventEmitter<void>();
  @Output() findItemEvent = new EventEmitter<void>();
  @Output() doNothingEvent = new EventEmitter<void>();
  @Output() teamRocketEncounterEvent = new EventEmitter<void>();

  actions: WheelItem[] = [
    { text: 'Catch a Pokémon', fillStyle: 'crimson', weight: 2 },
    { text: 'Training Arc', fillStyle: 'darkorange', weight: 2 },
    { text: 'Buy Potions', fillStyle: 'darkgoldenrod', weight: 2 },
    { text: 'Catch two Pokémon', fillStyle: 'green', weight: 2 },
    { text: 'Hunt a Legendary', fillStyle: 'darkcyan', weight: 2 },
    { text: 'Find an Item', fillStyle: 'blue', weight: 2 },
    { text: 'Go Straight', fillStyle: 'purple', weight: 1 },
    { text: 'Team Rocket Encounter', fillStyle: 'black', weight: 1 }
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
        this.catchTwoPokemonEvent.emit();
        break;
      case 4:
        this.legendaryEncounterEvent.emit();
        break;
      case 5:
        this.findItemEvent.emit();
        break;
      case 6:
        this.doNothingEvent.emit();
        break;
      case 7:
        this.teamRocketEncounterEvent.emit();
        break;
      default:
        break;
    }
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}
