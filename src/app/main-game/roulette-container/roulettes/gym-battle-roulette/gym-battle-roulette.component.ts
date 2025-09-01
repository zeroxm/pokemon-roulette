import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { gymLeadersByGeneration } from './gym-leaders-by-generation';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { ItemItem } from '../../../../interfaces/item-item';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { GymLeader } from '../../../../interfaces/gym-leader';

@Component({
  selector: 'app-gym-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
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
  ) { }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;

  @ViewChild('gymLeaderPresentationModal', { static: true }) gymLeaderPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  generation!: GenerationItem;
  trainerTeam!: PokemonItem[];
  trainerItems!: ItemItem[];
  @Input() currentRound!: number;
  @Input() fromLeader!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromLeaderChange = new EventEmitter<number>();

  victoryOdds: WheelItem[] = [
    { text: 'Yes', fillStyle: 'green', weight: 1 },
    { text: 'No', fillStyle: 'crimson', weight: 1 }
  ];

  currentLeader!: GymLeader;
  currentItem!: ItemItem;
  retries = 0;
  private teamSubscription!: Subscription;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });

    this.trainerItems = this.trainerService.getItems();

    this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
      this.trainerTeam = team;
      this.calcVictoryOdds();
    });

    this.gameSubscription = this.gameStateService.currentState.subscribe(state => {
      if (state === 'gym-battle') {
        this.currentLeader = this.getCurrentLeader();
        this.calcVictoryOdds();

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
    this.teamSubscription?.unsubscribe();
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

  private calcVictoryOdds(): void {
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

    if ((this.generation.id === 5 && (this.currentRound === 0 || this.currentRound === 7))
      || (this.generation.id === 7 && (this.currentRound === 2 || this.currentRound === 4))
      || (this.generation.id === 8 && (this.currentRound === 3 || this.currentRound === 5))) {

      const leaderNames = currentLeader.name.split('/');
      const leaderSprites = currentLeader.sprite;
      const leaderQuotes = currentLeader.quotes;
      const randomIndex = Math.floor(Math.random() * leaderNames.length);

      this.fromLeaderChange.emit(randomIndex);

      currentLeader = {
        name: leaderNames[randomIndex],
        sprite: leaderSprites[randomIndex],
        quotes: [leaderQuotes[randomIndex]]
      }
    }

    return currentLeader;
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
