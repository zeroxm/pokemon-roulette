import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../../../services/game-state-service/game-state.service';
import { gymLeadersByGeneration } from '../../../game-data/gym-leaders-by-generation';
import { GenerationItem } from '../../../interfaces/generation-item';
import { GymLeader } from '../../../interfaces/gym-leader';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { WheelItem } from '../../../interfaces/wheel-item';

@Component({
  selector: 'app-gym-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent
  ],
  templateUrl: './gym-battle-roulette.component.html',
  styleUrl: './gym-battle-roulette.component.css'
})
export class GymBattleRouletteComponent implements OnInit {

  gymLeadersByGeneration = gymLeadersByGeneration;

  constructor(private modalService: NgbModal,
              private gameStateService: GameStateService,
  ) {

  }

  @ViewChild('gymLeaderPresentationModal', { static: true }) contentTemplate!: TemplateRef<any>;

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green' },
    { text: 'No', fillStyle: 'crimson' }
  ];

  @Input() generation!: GenerationItem;
  @Input() currentRound!: number;
  @Input() trainerTeam!: PokemonItem[];
  @Output() battleResultEvent = new EventEmitter<boolean>();

  currentLeader!: GymLeader;

  ngOnInit(): void {
    this.gameStateService.currentState.subscribe(state => {
      if (state === 'gym-battle') {
        this.currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];
        this.victoryOdds = [];
        this.trainerTeam.forEach(pokemon => {
          for (let i = 0; i < pokemon.power; i++) {
            this.victoryOdds.push({ text: "Yes", fillStyle: "green" });
          }
        })

        for (let index = 0; index < this.currentRound; index++) {
          this.victoryOdds.push({ text: "No", fillStyle: "crimson" });
        }

        this.victoryOdds.push({ text: "No", fillStyle: "crimson" });

        this.modalService.open(this.contentTemplate, {
          centered: true,
          size: 'lg'
        });
      }
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  onItemSelected(index: number): void {
    this.battleResultEvent.emit(this.victoryOdds[index].text === 'Yes');
  }
}
