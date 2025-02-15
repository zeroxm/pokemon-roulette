import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { rivalByGeneration } from './rival-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../services/generation-service/generation.service';
import { TrainerService } from '../../../services/trainer-service/trainer.service';
import { Subscription } from 'rxjs';
import { GenerationItem } from '../../../interfaces/generation-item';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { ItemItem } from '../../../interfaces/item-item';
import { WheelItem } from '../../../interfaces/wheel-item';
import { GymLeader } from '../../../interfaces/gym-leader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rival-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent],
  templateUrl: './rival-battle-roulette.component.html',
  styleUrl: './rival-battle-roulette.component.css'
})
export class RivalBattleRouletteComponent implements OnInit, OnDestroy {

  rivalByGeneration = rivalByGeneration;

  constructor(private modalService: NgbModal,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService
  ) {

  }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;

  @ViewChild('gymLeaderPresentationModal', { static: true }) gymLeaderPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  generation!: GenerationItem;
  trainerTeam!: PokemonItem[];
  trainerItems!: ItemItem[];
  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green', weight: 1 },
    { text: 'No', fillStyle: 'crimson', weight: 1 }
  ];

  currentRival!: GymLeader;
  currentItem!: ItemItem;
  retries = 0;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });

    this.trainerTeam = this.trainerService.getTeam();
    this.trainerItems = this.trainerService.getItems();

    this.gameSubscription = this.gameStateService.currentState.subscribe(state => {
      if (state === 'battle-rival') {
        this.currentRival = this.getCurrentRival();
        this.victoryOdds = [];

        this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });

        this.trainerTeam.forEach(pokemon => {
          for (let i = 0; i < pokemon.power; i++) {
            this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });
          }
        });
        const powerModifier = this.plusModifiers();
        for (let i = 0; i < powerModifier; i++) {
          this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });
        }

        for (let index = 0; index < this.currentRound; index++) {
          this.victoryOdds.push({ text: "No", fillStyle: "crimson", weight: 1 });
        }

        this.victoryOdds.push({ text: "No", fillStyle: "crimson", weight: 1 });

        this.modalService.open(this.gymLeaderPresentationModal, {
          centered: true,
          size: 'lg'
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.gameSubscription?.unsubscribe();
    this.generationSubscription?.unsubscribe();
  }

  private plusModifiers(): number {
    let power = 0;
    const xAttacks = this.trainerItems.filter(item => item.name === 'x-attack');
    xAttacks.forEach(() => {
      const meanPower = this.trainerTeam.reduce((sum, pokemon) => sum + pokemon.power, 0) / this.trainerTeam.length;
      power += meanPower;
    });

    return power;
  }

  private getCurrentRival(): GymLeader {
    let currentRival = this.rivalByGeneration[this.generation.id];
    if ((this.generation.id === 6)) {
      const leaderNames = currentRival.name.split('/');
      const leaderSprites = currentRival.sprite;
      const leaderQuotes = currentRival.quotes;
      const randomIndex = Math.floor(Math.random() * leaderNames.length);

      currentRival = {
        name: leaderNames[randomIndex],
        sprite: leaderSprites[randomIndex],
        quotes: [leaderQuotes[randomIndex]]
      }
    }

    return currentRival;
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  onItemSelected(index: number): void {
    if (this.victoryOdds[index].text === 'Yes') {
      this.battleResultEvent.emit(true);
    } else {
      this.battleResultEvent.emit(false);
    }
  }
}
