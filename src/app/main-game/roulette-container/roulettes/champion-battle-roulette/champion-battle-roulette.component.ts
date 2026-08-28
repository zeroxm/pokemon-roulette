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
import { GymLeader } from '../../../../interfaces/gym-leader';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { BaseBattleRouletteComponent } from '../base-battle-roulette/base-battle-roulette.component';
import { resolveSplitTrainer, splitTrainerCount } from '../../../../utils/split-trainer';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

@Component({
  selector: 'app-champion-battle-roulette',
  imports: [
    ImageFallbackDirective,
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

  @Input() override currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromChampionChange = new EventEmitter<number>();

  currentChampion: GymLeader = { name: '', sprite: '', quotes: [''] };

  constructor(
    modalService: NgbModal,
    gameStateService: GameStateService,
    generationService: GenerationService,
    trainerService: TrainerService,
    translate: TranslateService,
    typeMatchupService: TypeMatchupService,
  ) {
    super(modalService, gameStateService, generationService, trainerService, translate, typeMatchupService);
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

  protected override async onGameStateChange(state: string): Promise<void> {
    if (state === 'champion-battle') {
      this.getCurrentChampion();
      this.calcVictoryOdds();
      this.modalService.open(this.championPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override readonly outcomeKeyPrefix = 'game.main.roulette.champion';
  protected override readonly baseNoOdds = 3;

  protected override calcVictoryOdds(): void {
    this.victoryOdds = this.buildVictoryOdds();
  }

  private getCurrentChampion(): void {
    this.currentChampion = this.championByGeneration[this.generation.id][0];

    if (this.generation.id === 7) {
      this.translate.get(this.currentChampion.name).pipe(take(1)).subscribe(translated => {
        const randomIndex = Math.floor(Math.random() * splitTrainerCount(translated));

        this.fromChampionChange.emit(randomIndex);
        this.currentChampion = resolveSplitTrainer(this.currentChampion, translated, randomIndex);
      });
    }
  }
}