import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { eliteFourByGeneration } from './elite-four-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { BaseBattleRouletteComponent } from '../base-battle-roulette/base-battle-roulette.component';
import { resolveSplitTrainer, splitTrainerCount } from '../../../../utils/split-trainer';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

@Component({
  selector: 'app-elite-four-battle-roulette',
  imports: [
    ImageFallbackDirective,
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './elite-four-battle-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './elite-four-battle-roulette.component.css'
})
export class EliteFourBattleRouletteComponent extends BaseBattleRouletteComponent {

  eliteFourByGeneration = eliteFourByGeneration;

  @ViewChild('eliteFourPresentationModal', { static: true }) eliteFourPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  @Input() override currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromEliteChange = new EventEmitter<number>();

  currentElite!: GymLeader;


  constructor(
    modalService: NgbModal,
    private modalQueueService: ModalQueueService,
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
    if (this.victoryOdds[index].text === 'game.main.roulette.elite.yes') {
      this.battleResultEvent.emit(true);
    } else {
      if (this.retries <= 0) {
        const potion = this.hasPotions();
        if (potion) {
          this.usePotion(potion, () => this.modalQueueService.open(this.itemUsedModal, { centered: true, size: 'md' }));
        } else {
          this.battleResultEvent.emit(false);
        }
      }
    }
  }

  protected override async onGameStateChange(state: string): Promise<void> {
    if (state === 'elite-four-battle') {
      this.getCurrentElite();
      this.calcVictoryOdds();
      this.modalQueueService.open(this.eliteFourPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override readonly outcomeKeyPrefix = 'game.main.roulette.elite';
  protected override readonly baseNoOdds = 2;

  protected override calcVictoryOdds(): void {
    this.victoryOdds = this.buildVictoryOdds(this.currentElite?.types);
  }

  private getCurrentElite(): void {
    this.currentElite = this.eliteFourByGeneration[this.generation.id][this.currentRound % 4];

    if (this.generation.id === 8 && (this.currentRound % 4 === 0 || this.currentRound % 4 === 2)) {
      this.translate.get(this.currentElite.name).pipe(take(1)).subscribe(translated => {
        const randomIndex = Math.floor(Math.random() * splitTrainerCount(translated));

        this.fromEliteChange.emit(randomIndex);
        this.currentElite = resolveSplitTrainer(this.currentElite, translated, randomIndex);

        this.calcVictoryOdds();
      });
    }
  }
}