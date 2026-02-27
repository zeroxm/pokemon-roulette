import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { eliteFourByGeneration } from './elite-four-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
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
  selector: 'app-elite-four-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './elite-four-battle-roulette.component.html',
  styleUrl: './elite-four-battle-roulette.component.css'
})
export class EliteFourBattleRouletteComponent implements OnInit, OnDestroy {

  eliteFourByGeneration = eliteFourByGeneration;

  constructor(private modalService: NgbModal,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private translate: TranslateService
  ) { }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;

  @ViewChild('eliteFourPresentationModal', { static: true }) eliteFourPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  generation!: GenerationItem;
  trainerTeam!: PokemonItem[];
  trainerItems!: ItemItem[];
  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromEliteChange = new EventEmitter<number>();

  victoryOdds: WheelItem[] = [
    { text: 'game.main.roulette.elite.yes', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.elite.no', fillStyle: 'crimson', weight: 1 }
  ];

  currentElite!: GymLeader;
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
      if (state === 'elite-four-battle') {
        this.getCurrentElite();
        this.calcVictoryOdds();

        this.modalService.open(this.eliteFourPresentationModal, {
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
    if (this.victoryOdds[index].text === 'game.main.roulette.elite.yes') {
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
    const yesOdds: WheelItem[] = [];
    const noOdds: WheelItem[] = [];

    yesOdds.push({ text: "game.main.roulette.elite.yes", fillStyle: "green", weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push({ text: "game.main.roulette.elite.yes", fillStyle: "green", weight: 1 });
      }
    });

    const powerModifier = this.plusModifiers();
  
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push({ text: "game.main.roulette.elite.yes", fillStyle: "green", weight: 1 });
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });
    }
    // elite four battles should be harder, so it starts with 2 noOdds
    noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });
    noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });

    const total = yesOdds.length + noOdds.length;
    // chunk size tiers: 1 for 0-8 elements, 2 for 9-29, 3 for 30+
    let chunk = 1;
    if (total > 8) chunk = 2;
    if (total > 29) chunk = 3;
    this.victoryOdds = this.interleaveOdds(yesOdds, noOdds, chunk);
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

  private interleaveOdds(yes: WheelItem[], no: WheelItem[], chunk = 2): WheelItem[] {
    const result: WheelItem[] = [];
    while (yes.length || no.length) {
      for (let i = 0; i < chunk && yes.length; i++) {
        result.push(yes.shift()!);
      }
      for (let i = 0; i < chunk && no.length; i++) {
        result.push(no.shift()!);
      }
    }
    return result;
  }

  private getCurrentElite(): void {

    this.currentElite = this.eliteFourByGeneration[this.generation.id][this.currentRound%4];

    if ((this.generation.id === 8 && (this.currentRound%4 === 0 || this.currentRound%4 === 2))) {

      this.translate.get(this.currentElite.name).subscribe(translated => {
        const eliteNames = translated.split('/');
        const eliteSprites = Array.isArray(this.currentElite.sprite) ? this.currentElite.sprite : [this.currentElite.sprite];
        const eliteQuotes = Array.isArray(this.currentElite.quotes) ? this.currentElite.quotes : this.currentElite.quotes;
        const randomIndex = Math.floor(Math.random() * eliteNames.length);

        this.fromEliteChange.emit(randomIndex);

        this.currentElite = {
          name: eliteNames[randomIndex],
          sprite: eliteSprites[randomIndex],
          quotes: [Array.isArray(eliteQuotes) ? eliteQuotes[randomIndex] : eliteQuotes]
        } as GymLeader;
      });
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
