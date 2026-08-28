import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { rivalByGeneration } from './rival-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { BaseBattleRouletteComponent } from '../base-battle-roulette/base-battle-roulette.component';
import { resolveSplitTrainer } from '../../../../utils/split-trainer';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

@Component({
  selector: 'app-rival-battle-roulette',
  imports: [
    ImageFallbackDirective,
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './rival-battle-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './rival-battle-roulette.component.css'
})
export class RivalBattleRouletteComponent extends BaseBattleRouletteComponent {

  rivalByGeneration = rivalByGeneration;

  @ViewChild('rivalPresentationModal', { static: true }) rivalPresentationModal!: TemplateRef<any>;

  @Input() override currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromRivalChange = new EventEmitter<number>();

  currentRival!: GymLeader;

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
    if (this.victoryOdds[index].text === 'game.main.roulette.rival.yes') {
      this.battleResultEvent.emit(true);
    } else {
      this.battleResultEvent.emit(false);
    }
  }

  protected override onGameStateChange(state: string): void {
    if (state === 'battle-rival') {
      this.getCurrentRival();
      this.calcVictoryOdds();
      void this.modalQueueService.open(this.rivalPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override readonly outcomeKeyPrefix = 'game.main.roulette.rival';
  protected override readonly baseNoOdds = 1;

  protected override calcVictoryOdds(): void {
    this.victoryOdds = this.buildVictoryOdds();
  }

  private getCurrentRival(): void {
    this.currentRival = this.rivalByGeneration[this.generation.id];

    if (this.generation.id === 6) {
      this.translate.get(this.currentRival.name).pipe(take(1)).subscribe(translated => {
        // If the player is male, rival is Serena; if female, rival is Calem.
        const selectedIndex = this.trainerService.gender === 'male' ? 1 : 0;

        this.fromRivalChange.emit(selectedIndex);
        this.currentRival = resolveSplitTrainer(this.currentRival, translated, selectedIndex);
      });
    }
  }
}