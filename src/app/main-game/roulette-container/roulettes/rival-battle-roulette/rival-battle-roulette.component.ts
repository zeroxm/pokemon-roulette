import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { rivalByGeneration } from './rival-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
  selector: 'app-rival-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './rival-battle-roulette.component.html',
  styleUrl: './rival-battle-roulette.component.css'
})
export class RivalBattleRouletteComponent implements OnInit, OnDestroy {

  rivalByGeneration = rivalByGeneration;

  constructor(private modalService: NgbModal,
    private gameStateService: GameStateService,
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private translate: TranslateService
  ) {

  }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;

  @ViewChild('rivalPresentationModal', { static: true }) rivalPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  generation!: GenerationItem;
  trainerTeam!: PokemonItem[];
  trainerItems!: ItemItem[];
  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromRivalChange = new EventEmitter<number>();


  victoryOdds: WheelItem[] = [
    { text: 'game.main.roulette.rival.yes', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.rival.no', fillStyle: 'crimson', weight: 1 }
  ];

  currentRival!: GymLeader;
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
      if (state === 'battle-rival') {
        this.getCurrentRival();
        this.calcVictoryOdds();

        this.modalService.open(this.rivalPresentationModal, {
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
    if (this.victoryOdds[index].text === 'game.main.roulette.rival.yes') {
      this.battleResultEvent.emit(true);
    } else {
      this.battleResultEvent.emit(false);
    }
  }

  private calcVictoryOdds(): void {
    const yesOdds: WheelItem[] = [];
    const noOdds: WheelItem[] = [];

    yesOdds.push({ text: "game.main.roulette.rival.yes", fillStyle: "green", weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push({ text: "game.main.roulette.rival.yes", fillStyle: "green", weight: 1 });
      }
    });
    const powerModifier = this.plusModifiers();
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push({ text: "game.main.roulette.rival.yes", fillStyle: "green", weight: 1 });
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: "game.main.roulette.rival.no", fillStyle: "crimson", weight: 1 });
    }
    // Rival battles mirrors the current gym-leader, but you don't lose the game on then, so it starts with 1 noOdds
    noOdds.push({ text: "game.main.roulette.rival.no", fillStyle: "crimson", weight: 1 });

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

  private getCurrentRival(): void {
    this.currentRival = this.rivalByGeneration[this.generation.id];
    if ((this.generation.id === 6)) {

      this.translate.get(this.currentRival.name).subscribe(translated => {
        const rivalNames = translated.split('/');
        const rivalSprites = Array.isArray(this.currentRival.sprite) ? this.currentRival.sprite : [this.currentRival.sprite];
        const rivalQuotes = Array.isArray(this.currentRival.quotes) ? this.currentRival.quotes : this.currentRival.quotes;
        const randomIndex = Math.floor(Math.random() * rivalNames.length);

        this.fromRivalChange.emit(randomIndex);

        this.currentRival = {
          name: rivalNames[randomIndex],
          sprite: rivalSprites[randomIndex],
          quotes: [Array.isArray(rivalQuotes) ? rivalQuotes[randomIndex] : rivalQuotes]
        } as GymLeader;
      });
    }
  }
}
