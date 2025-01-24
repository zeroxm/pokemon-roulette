import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { CommonModule } from '@angular/common';
import { WheelItem } from '../../../interfaces/wheel-item';
import { GenerationItem } from '../../../interfaces/generation-item';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../../../services/game-state-service/game-state.service';
import { GymLeader } from '../../../interfaces/gym-leader';

@Component({
  selector: 'app-gym-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent
  ],
  templateUrl: './gym-battle-roulette.component.html',
  styleUrl: './gym-battle-roulette.component.css'
})
export class GymBattleRouletteComponent {

    constructor(private modalService: NgbModal,
                private gameStateService: GameStateService,
    ) { }

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green' },
    { text: 'No', fillStyle: 'crimson' }
  ];

  @Input() generation!: GenerationItem;
  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();

  currentLeader!: GymLeader;


  onItemSelected(index: number): void {
    this.battleResultEvent.emit(this.victoryOdds[index].text === 'Yes');
  }
}
