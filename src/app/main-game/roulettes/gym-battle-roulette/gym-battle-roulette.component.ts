import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class GymBattleRouletteComponent implements OnInit, OnDestroy {

  gymLeadersByGeneration = gymLeadersByGeneration;

  private subscription: Subscription | null = null;

  constructor(private modalService: NgbModal,
              private gameStateService: GameStateService,
  ) {

  }

  @ViewChild('gymLeaderPresentationModal', { static: true }) contentTemplate!: TemplateRef<any>;

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green', weight: 1 },
    { text: 'No', fillStyle: 'crimson', weight: 1 }
  ];

  @Input() generation!: GenerationItem;
  @Input() currentRound!: number;
  @Input() trainerTeam!: PokemonItem[];
  @Output() battleResultEvent = new EventEmitter<boolean>();

  currentLeader!: GymLeader;

  ngOnInit(): void {
    this.subscription = this.gameStateService.currentState.subscribe(state => {
      if (state === 'gym-battle') {
        this.currentLeader = this.getCurrentLeader();
        this.victoryOdds = [];
        this.trainerTeam.forEach(pokemon => {
          for (let i = 0; i < pokemon.power; i++) {
            this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });
          }
        })

        for (let index = 0; index < this.currentRound; index++) {
          this.victoryOdds.push({ text: "No", fillStyle: "crimson", weight: 1 });
        }

        this.victoryOdds.push({ text: "No", fillStyle: "crimson", weight: 1 });

        this.modalService.open(this.contentTemplate, {
          centered: true,
          size: 'lg'
        });
      }
    });
  }

  private getCurrentLeader(): GymLeader {
    let currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];
    if((this.generation.id === 5 && this.currentRound === 0 || this.currentRound === 7)
    || (this.generation.id === 8 && this.currentRound === 3 || this.currentRound === 5)) {
      const leaderNames = currentLeader.name.split('/');
      const leaderSprites = currentLeader.sprite;
      const leaderQuotes = currentLeader.quotes;
      const randomIndex = Math.floor(Math.random() * leaderNames.length);

      currentLeader = {
        name: leaderNames[randomIndex],
        sprite: leaderSprites[randomIndex],
        quotes: [leaderQuotes[randomIndex]]
      }
    }

    return currentLeader;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  onItemSelected(index: number): void {
    this.battleResultEvent.emit(this.victoryOdds[index].text === 'Yes');
  }
}

