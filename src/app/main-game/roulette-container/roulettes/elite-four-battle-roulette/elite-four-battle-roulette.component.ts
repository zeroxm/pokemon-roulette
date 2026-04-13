import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { eliteFourByGeneration } from './elite-four-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
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
import { interleaveOdds } from '../../../../utils/odd-utils';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { PokemonType, pokemonTypeDataByKey } from '../../../../interfaces/pokemon-type';

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
    private modalQueueService: ModalQueueService,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private translate: TranslateService,
    private typeMatchupService: TypeMatchupService
  ) { }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;

  @ViewChild('eliteFourPresentationModal', { static: true }) eliteFourPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;
  @ViewChild('typeAdvantageModal', { static: true }) typeAdvantageModal!: TemplateRef<any>;

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
  private currentGameState = '';
  advantageLabel: 'overwhelming' | 'advantage' | 'disadvantage' | null = null;
  advantageLabelKey = '';
  strongCount = 0;
  weakCount = 0;
  private readonly typeIconBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });

    this.trainerItems = this.trainerService.getItems();

    this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
      this.trainerTeam = team;
      this.calcVictoryOdds();
      if (this.currentGameState === 'elite-four-battle' && this.currentElite && this.advantageLabel) {
        this.queueTypeAdvantageModal();
      }
    });

    this.gameSubscription = this.gameStateService.currentState.subscribe(state => {
      this.currentGameState = state;
      if (state === 'elite-four-battle') {
        this.getCurrentElite();
        this.calcVictoryOdds();

        this.modalQueueService.open(this.eliteFourPresentationModal, {
          centered: true,
          size: 'lg'
        });
        this.queueTypeAdvantageModal();
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

    if (this.currentElite?.types?.length) {
      const { strongCount, weakCount } = this.typeMatchupService.calcTeamMatchup(
        this.trainerTeam,
        this.currentElite.types
      );
      this.strongCount = strongCount;
      this.weakCount = weakCount;
      this.advantageLabel = this.typeMatchupService.getAdvantageLabel(strongCount, weakCount);
      if (this.advantageLabel === 'overwhelming') {
        for (let i = 0; i < 3; i++) yesOdds.push({ text: 'game.main.roulette.elite.yes', fillStyle: 'green', weight: 1 });
      } else if (this.advantageLabel === 'advantage') {
        for (let i = 0; i < 2; i++) yesOdds.push({ text: 'game.main.roulette.elite.yes', fillStyle: 'green', weight: 1 });
      } else if (this.advantageLabel === 'disadvantage') {
        const extraNo = weakCount > 3 ? 2 : 1;
        for (let i = 0; i < extraNo; i++) noOdds.push({ text: 'game.main.roulette.elite.no', fillStyle: 'crimson', weight: 1 });
      }
      this.advantageLabelKey = this.advantageLabel
        ? `game.main.roulette.gym.typeAdvantage.${this.advantageLabel}`
        : '';
    } else {
      this.advantageLabel = null;
      this.advantageLabelKey = '';
      this.strongCount = 0;
      this.weakCount = 0;
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });
    }
    // elite four battles should be harder, so it starts with 2 noOdds
    noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });
    noOdds.push({ text: "game.main.roulette.elite.no", fillStyle: "crimson", weight: 1 });

    this.victoryOdds = interleaveOdds(yesOdds, noOdds);
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

  private getCurrentElite(): void {

    this.currentElite = this.eliteFourByGeneration[this.generation.id][this.currentRound%4];

    if ((this.generation.id === 8 && (this.currentRound%4 === 0 || this.currentRound%4 === 2))) {

      const eliteTypes = Array.isArray(this.currentElite.types) ? this.currentElite.types : undefined;

      this.translate.get(this.currentElite.name).pipe(take(1)).subscribe(translated => {
        const eliteNames = translated.split('/');
        const eliteSprites = Array.isArray(this.currentElite.sprite) ? this.currentElite.sprite : [this.currentElite.sprite];
        const eliteQuotes = Array.isArray(this.currentElite.quotes) ? this.currentElite.quotes : this.currentElite.quotes;
        const randomIndex = Math.floor(Math.random() * eliteNames.length);

        this.fromEliteChange.emit(randomIndex);

        this.currentElite = {
          name: eliteNames[randomIndex],
          sprite: eliteSprites[randomIndex],
          quotes: [Array.isArray(eliteQuotes) ? eliteQuotes[randomIndex] : eliteQuotes],
          types: eliteTypes ? [eliteTypes[randomIndex]] : undefined
        } as GymLeader;

        this.calcVictoryOdds();
        this.queueTypeAdvantageModal();
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

    this.modalQueueService.open(this.itemUsedModal, {
      centered: true,
      size: 'md'
    });
  }

  getTypeIconUrl(type: PokemonType): string {
    return `${this.typeIconBaseUrl}/${pokemonTypeDataByKey[type].id}.png`;
  }

  private queueTypeAdvantageModal(): void {
    if (this.advantageLabel) {
      this.modalQueueService.open(this.typeAdvantageModal, { centered: true, size: 'md' });
    }
  }
}
