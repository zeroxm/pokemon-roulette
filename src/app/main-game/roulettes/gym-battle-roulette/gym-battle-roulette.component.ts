import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WheelComponent } from "../../../wheel/wheel.component";
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../../../services/game-state-service/game-state.service';
import { GenerationItem } from '../../../interfaces/generation-item';
import { GymLeader } from '../../../interfaces/gym-leader';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { WheelItem } from '../../../interfaces/wheel-item';
import { ItemItem } from '../../../interfaces/item-item';
import { gymLeadersByGeneration } from './gym-leaders-by-generation';
import { GenerationService } from '../../../services/generation-service/generation.service';
import { TrainerService } from '../../../services/trainer-service/trainer.service';

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
  @Output() trainerItemsChange = new EventEmitter<ItemItem[]>();

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green', weight: 1 },
    { text: 'No', fillStyle: 'crimson', weight: 1 }
  ];

  currentLeader!: GymLeader;
  currentItem!: ItemItem;
  retries = 0;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });

    this.trainerTeam = this.trainerService.getTeam();
    this.trainerItems = this.trainerService.getItems();

    this.gameSubscription = this.gameStateService.currentState.subscribe(state => {
      if (state === 'gym-battle') {
        this.currentLeader = this.getCurrentLeader();
        this.victoryOdds = [];

        this.trainerTeam.forEach(pokemon => {
          for (let i = 0; i < pokemon.power; i++) {
            this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });
          }
        })
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
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.generationSubscription) {
      this.generationSubscription.unsubscribe();
    }
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

  private getCurrentLeader(): GymLeader {
    let currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];
    if ((this.generation.id === 5 && this.currentRound === 0 || this.currentRound === 7)
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

  closeModal(): void {
    this.modalService.dismissAll();
  }

  onItemSelected(index: number): void {
    this.retries--;
    if (this.victoryOdds[index].text === 'Yes') {
      this.battleResultEvent.emit(true);
    } else {
      if (this.retries <= 0) {
        const potion = this.hasPotions();
        if (potion) {
          this.usePotion(potion);
        } else {
          this.battleResultEvent.emit(false);
        }
      }
    }
  }

  private hasPotions(): ItemItem | undefined {
    const potionItem = this.trainerItems.find(item =>
      item.name === 'potion' || item.name === 'super-potion' || item.name === 'hyper-potion'
    );
    return potionItem;
  }

  private usePotion(potion: ItemItem): void {
    const index = this.trainerItems.indexOf(potion);
    this.currentItem = potion;
    if (index !== -1) {
      this.trainerItems.splice(index, 1);
      this.trainerItemsChange.emit(this.trainerItems);
    }

    switch (potion.name) {
      case 'potion':
        this.retries = 1;
        break;
      case 'super-potion':
        this.retries = 2;
        break;
      case 'hyper-potion':
        this.retries = 3;
        break;
    }

    this.modalService.open(this.itemUsedModal, {
      centered: true,
      size: 'md'
    });
  }
}

