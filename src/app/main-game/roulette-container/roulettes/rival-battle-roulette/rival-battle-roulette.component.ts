import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { rivalByGeneration } from './rival-by-generation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
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
  selector: 'app-rival-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './rival-battle-roulette.component.html',
  styleUrl: './rival-battle-roulette.component.css'
})
export class RivalBattleRouletteComponent extends BaseBattleRouletteComponent {

  rivalByGeneration = rivalByGeneration;

  @ViewChild('rivalPresentationModal', { static: true }) rivalPresentationModal!: TemplateRef<any>;

  @Input() currentRound!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromRivalChange = new EventEmitter<number>();

  currentRival!: GymLeader;

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
      this.modalService.open(this.rivalPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override calcVictoryOdds(): void {
    const yesOdds: WheelItem[] = [];
    const noOdds: WheelItem[] = [];

    yesOdds.push({ text: 'game.main.roulette.rival.yes', fillStyle: 'green', weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push({ text: 'game.main.roulette.rival.yes', fillStyle: 'green', weight: 1 });
      }
    });

    const powerModifier = this.plusModifiers();
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push({ text: 'game.main.roulette.rival.yes', fillStyle: 'green', weight: 1 });
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: 'game.main.roulette.rival.no', fillStyle: 'crimson', weight: 1 });
    }
    // Rival battles mirror the current gym-leader difficulty; starts with 1 noOdds
    noOdds.push({ text: 'game.main.roulette.rival.no', fillStyle: 'crimson', weight: 1 });

    this.victoryOdds = interleaveOdds(yesOdds, noOdds);
  }

  private getCurrentRival(): void {
    this.currentRival = this.rivalByGeneration[this.generation.id];

    if (this.generation.id === 6) {
      this.translate.get(this.currentRival.name).pipe(take(1)).subscribe(translated => {
        const rivalNames = translated.split('/');
        const rivalSprites = Array.isArray(this.currentRival.sprite) ? this.currentRival.sprite : [this.currentRival.sprite];
        const rivalQuotes = Array.isArray(this.currentRival.quotes) ? this.currentRival.quotes : [this.currentRival.quotes];
        // If the player is male, rival is Serena; if female, rival is Calem.
        const selectedIndex = this.trainerService.gender === 'male' ? 1 : 0;

        this.fromRivalChange.emit(selectedIndex);

        this.currentRival = {
          name: rivalNames[selectedIndex],
          sprite: rivalSprites[selectedIndex],
          quotes: [rivalQuotes[selectedIndex]]
        } as GymLeader;
      });
    }
  }
}