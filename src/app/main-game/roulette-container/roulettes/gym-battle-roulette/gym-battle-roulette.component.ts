import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';
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
import { gymLeadersByGeneration } from './gym-leaders-by-generation';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

@Component({
  selector: 'app-gym-battle-roulette',
  imports: [
    ImageFallbackDirective,
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './gym-battle-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gym-battle-roulette.component.css'
})
export class GymBattleRouletteComponent extends BaseBattleRouletteComponent {

  gymLeadersByGeneration = gymLeadersByGeneration;

  @ViewChild('gymLeaderPresentationModal', { static: true }) gymLeaderPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  @Input() override currentRound!: number;
  @Input() fromLeader!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromLeaderChange = new EventEmitter<number>();

  currentLeader!: GymLeader;


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
    if (this.victoryOdds[index].text === 'game.main.roulette.gym.yes') {
      this.battleResultEvent.emit(true);
    } else {
      if (this.retries <= 0) {
        const potion = this.hasPotions();
        if (potion) {
          this.usePotion(potion, () => this.modalQueueService.open(this.itemUsedModal, { centered: true, size: 'md' }));
        } else if (this.hasDisguise() && this.useDisguise(() => this.openDisguiseNotice(this.modalQueueService))) {
          // Mimikyu took the hit: the retry is already granted, so the battle does not end here.
        } else {
          this.battleResultEvent.emit(false);
        }
      }
    }
  }

  protected override async onGameStateChange(state: string): Promise<void> {
    if (state === 'gym-battle') {
      this.getCurrentLeader();
      this.calcVictoryOdds();
      this.modalQueueService.open(this.gymLeaderPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override readonly outcomeKeyPrefix = 'game.main.roulette.gym';
  protected override readonly baseNoOdds = 1;

  protected override calcVictoryOdds(): void {
    this.victoryOdds = this.buildVictoryOdds(this.currentLeader?.types);
  }

  private getCurrentLeader(): void {
    this.currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];

    if ((this.generation.id === 5 && (this.currentRound === 0 || this.currentRound === 7))
      || (this.generation.id === 7 && (this.currentRound === 2 || this.currentRound === 4))
      || (this.generation.id === 8 && (this.currentRound === 3 || this.currentRound === 5))) {

      this.translate.get(this.currentLeader.name).pipe(take(1)).subscribe(translated => {
        const randomIndex = Math.floor(Math.random() * splitTrainerCount(translated));

        this.fromLeaderChange.emit(randomIndex);
        this.currentLeader = resolveSplitTrainer(this.currentLeader, translated, randomIndex);

        this.calcVictoryOdds();
      });
    }
  }
}