import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { championByGeneration } from './champion-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { interleaveOdds } from '../../../../utils/odd-utils';
import { BaseBattleRouletteComponent } from '../base-battle-roulette/base-battle-roulette.component';

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
export class ChampionBattleRouletteComponent extends BaseBattleRouletteComponent {

  championByGeneration = championByGeneration;

  @ViewChild('championPresentationModal', { static: true }) championPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromChampionChange = new EventEmitter<number>();

  currentChampion: GymLeader = { name: '', sprite: '', quotes: [''] };

  constructor(
    modalService: NgbModal,
    gameStateService: GameStateService,
    generationService: GenerationService,
    trainerService: TrainerService,
    translate: TranslateService
  ) {
    super(modalService, gameStateService, generationService, trainerService, translate);
  }

  onItemSelected(index: number): void {
    this.retries--;
    if (this.victoryOdds[index].text === 'game.main.roulette.champion.yes') {
      this.battleResultEvent.emit(true);
    } else {
      if (this.retries <= 0) {
        const potion = this.hasPotions();
        if (potion) {
          this.usePotion(potion, () => this.modalService.open(this.itemUsedModal, { centered: true, size: 'md' }));
        } else {
          this.battleResultEvent.emit(false);
        }
      }
    }
  }

  protected override onGameStateChange(state: string): void {
    if (state === 'champion-battle') {
      this.getCurrentChampion();
      this.calcVictoryOdds();
      this.modalService.open(this.championPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override calcVictoryOdds(): void {
    const yesOdds: WheelItem[] = [];
    const noOdds: WheelItem[] = [];

    yesOdds.push({ text: 'game.main.roulette.champion.yes', fillStyle: 'green', weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push({ text: 'game.main.roulette.champion.yes', fillStyle: 'green', weight: 1 });
      }
    });

    const powerModifier = this.plusModifiers();
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push({ text: 'game.main.roulette.champion.yes', fillStyle: 'green', weight: 1 });
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: 'game.main.roulette.champion.no', fillStyle: 'crimson', weight: 1 });
    }
    // Champion battles should be the toughest, so it starts with 3 noOdds
    noOdds.push({ text: 'game.main.roulette.champion.no', fillStyle: 'crimson', weight: 1 });
    noOdds.push({ text: 'game.main.roulette.champion.no', fillStyle: 'crimson', weight: 1 });
    noOdds.push({ text: 'game.main.roulette.champion.no', fillStyle: 'crimson', weight: 1 });

    this.victoryOdds = interleaveOdds(yesOdds, noOdds);
  }

  private getCurrentChampion(): void {
    this.currentChampion = this.championByGeneration[this.generation.id][0];

    if (this.generation.id === 7) {
      this.translate.get(this.currentChampion.name).pipe(take(1)).subscribe(translated => {
        const championNames = translated.split('/');
        const championSprites = Array.isArray(this.currentChampion.sprite) ? this.currentChampion.sprite : [this.currentChampion.sprite];
        const championQuotes = Array.isArray(this.currentChampion.quotes) ? this.currentChampion.quotes : this.currentChampion.quotes;
        const randomIndex = Math.floor(Math.random() * championNames.length);

        this.fromChampionChange.emit(randomIndex);

        this.currentChampion = {
          name: championNames[randomIndex],
          sprite: championSprites[randomIndex],
          quotes: [Array.isArray(championQuotes) ? championQuotes[randomIndex] : championQuotes]
        } as GymLeader;
      });
    }
  }
}