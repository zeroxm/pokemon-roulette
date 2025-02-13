import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { championByGeneration } from './champion-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameStateService } from '../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../services/generation-service/generation.service';
import { TrainerService } from '../../../services/trainer-service/trainer.service';
import { CommonModule } from '@angular/common';
import { WheelComponent } from '../../../wheel/wheel.component';
import { Subscription } from 'rxjs';
import { GenerationItem } from '../../../interfaces/generation-item';
import { PokemonItem } from '../../../interfaces/pokemon-item';
import { ItemItem } from '../../../interfaces/item-item';
import { WheelItem } from '../../../interfaces/wheel-item';
import { GymLeader } from '../../../interfaces/gym-leader';

@Component({
  selector: 'app-champion-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent
  ],
  templateUrl: './champion-battle-roulette.component.html',
  styleUrl: './champion-battle-roulette.component.css'
})
export class ChampionBattleRouletteComponent implements OnInit, OnDestroy {
  
  championByGeneration = championByGeneration;
  
  constructor(private modalService: NgbModal,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService
  ) { }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;
  
  @ViewChild('championPresentationModal', { static: true }) championPresentationModal!: TemplateRef<any>;
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

  champion!: GymLeader;
  currentItem!: ItemItem;
  retries = 0;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });

    this.trainerTeam = this.trainerService.getTeam();
    this.trainerItems = this.trainerService.getItems();

    this.gameSubscription = this.gameStateService.currentState.subscribe(state => {

      if (state === 'champion-battle') {
        this.champion = this.getChampion();
        this.victoryOdds = [];

        this.victoryOdds.push({ text: "Yes", fillStyle: "green", weight: 1 });

        this.trainerTeam.slice(0, 6).forEach(pokemon => {
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

        this.modalService.open(this.championPresentationModal, {
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
      const meanPower = this.trainerTeam.slice(0, 6).reduce((sum, pokemon) => sum + pokemon.power, 0) / this.trainerTeam.slice(0, 6).length;
      power += meanPower;
    });

    return power;
  }

  private getChampion(): GymLeader {
    return this.championByGeneration[this.generation.id][0];
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
      this.trainerService.removeItem(potion);
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
