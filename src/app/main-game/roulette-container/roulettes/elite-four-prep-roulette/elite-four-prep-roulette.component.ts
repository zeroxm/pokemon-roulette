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
    { text: 'game.main.roulette.elite.prep.actions.catchPokemon', fillStyle: 'crimson', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.trainingArc', fillStyle: 'darkorange', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.buyPotions', fillStyle: 'darkgoldenrod', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.catchTwoPokemon', fillStyle: 'green', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.huntLegendary', fillStyle: 'darkcyan', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.findItem', fillStyle: 'blue', weight: 2 },
    { text: 'game.main.roulette.elite.prep.actions.goStraight', fillStyle: 'purple', weight: 1 },
    { text: 'game.main.roulette.elite.prep.actions.teamRocket', fillStyle: 'black', weight: 1 }
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
