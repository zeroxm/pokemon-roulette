import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { championByGeneration } from './champion-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
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
  selector: 'app-champion-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './champion-battle-roulette.component.html',
  styleUrl: './champion-battle-roulette.component.css'
})
export class ChampionBattleRouletteComponent implements OnInit, OnDestroy {

  championByGeneration = championByGeneration;

  constructor(private modalService: NgbModal,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private translate: TranslateService
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
  @Output() fromChampionChange = new EventEmitter<number>();

  victoryOdds: WheelItem[] = [
    { text: 'game.main.roulette.champion.yes', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.champion.no', fillStyle: 'crimson', weight: 1 }
  ];

  currentChampion!: GymLeader;
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

      if (state === 'champion-battle') {
        this.currentChampion = this.getChampion();
        this.calcVictoryOdds();

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
      this.teamSubscription?.unsubscribe();
  }


  closeModal(): void {
    this.modalService.dismissAll();
  }

  onItemSelected(index: number): void {
    this.retries--;
    if (this.victoryOdds[index].text === 'game.main.roulette.champion.yes') {
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

    this.victoryOdds.push({ text: "game.main.roulette.champion.yes", fillStyle: "green", weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        this.victoryOdds.push({ text: "game.main.roulette.champion.yes", fillStyle: "green", weight: 1 });
      }
    });

    const powerModifier = this.plusModifiers();

    for (let i = 0; i < powerModifier; i++) {
      this.victoryOdds.push({ text: "game.main.roulette.champion.yes", fillStyle: "green", weight: 1 });
    }

    for (let index = 0; index < this.currentRound; index++) {
      this.victoryOdds.push({ text: "game.main.roulette.champion.no", fillStyle: "crimson", weight: 1 });
    }

    this.victoryOdds.push({ text: "game.main.roulette.champion.no", fillStyle: "crimson", weight: 1 });
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

  private getChampion(): GymLeader {
    let currentChampion = this.championByGeneration[this.generation.id][0];

    console.log('Selected champion:', currentChampion);
    if (this.generation.id === 7) {

      this.translate.get(currentChampion.name).subscribe(translated => {
        const championNames = translated.split('/');
        const championSprites = Array.isArray(currentChampion.sprite) ? currentChampion.sprite : [currentChampion.sprite];
        const championQuotes = Array.isArray(currentChampion.quotes) ? currentChampion.quotes : currentChampion.quotes;
        const randomIndex = Math.floor(Math.random() * championNames.length);

        this.fromChampionChange.emit(randomIndex);

        this.currentChampion = {
          name: championNames[randomIndex],
          sprite: championSprites[randomIndex],
          quotes: [Array.isArray(championQuotes) ? championQuotes[randomIndex] : championQuotes]
        } as GymLeader;
      });
     }

     return currentChampion;
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
