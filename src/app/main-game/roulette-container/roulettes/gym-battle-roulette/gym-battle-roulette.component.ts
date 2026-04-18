import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { interleaveOdds } from '../../../../utils/odd-utils';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { pokemonTypeDataByKey, PokemonType } from '../../../../interfaces/pokemon-type';
import { BaseBattleRouletteComponent } from '../base-battle-roulette/base-battle-roulette.component';
import { gymLeadersByGeneration } from './gym-leaders-by-generation';

@Component({
  selector: 'app-gym-battle-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './gym-battle-roulette.component.html',
  styleUrl: './gym-battle-roulette.component.css'
})
export class GymBattleRouletteComponent extends BaseBattleRouletteComponent {

  gymLeadersByGeneration = gymLeadersByGeneration;

  @ViewChild('gymLeaderPresentationModal', { static: true }) gymLeaderPresentationModal!: TemplateRef<any>;
  @ViewChild('itemUsedModal', { static: true }) itemUsedModal!: TemplateRef<any>;

  @Input() currentRound!: number;
  @Input() fromLeader!: number;
  @Output() battleResultEvent = new EventEmitter<boolean>();
  @Output() fromLeaderChange = new EventEmitter<number>();

  currentLeader!: GymLeader;
  strongCount = 0;
  weakCount = 0;
  advantageLabel: 'overwhelming' | 'advantage' | 'disadvantage' | null = null;
  advantageLabelKey = '';
  matchupAdvantageTypes: PokemonType[] = [];
  matchupDisadvantageTypes: PokemonType[] = [];

  private readonly typeIconBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

  constructor(
    modalService: NgbModal,
    private modalQueueService: ModalQueueService,
    gameStateService: GameStateService,
    generationService: GenerationService,
    trainerService: TrainerService,
    translate: TranslateService,
    private typeMatchupService: TypeMatchupService
  ) {
    super(modalService, gameStateService, generationService, trainerService, translate);
  }

  getTypeIconUrl(type: PokemonType): string {
    return `${this.typeIconBaseUrl}/${pokemonTypeDataByKey[type].id}.png`;
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
        } else {
          this.battleResultEvent.emit(false);
        }
      }
    }
  }

  protected override onGameStateChange(state: string): void {
    if (state === 'gym-battle') {
      this.getCurrentLeader();
      this.calcVictoryOdds();
      this.modalQueueService.open(this.gymLeaderPresentationModal, { centered: true, size: 'lg' });
    }
  }

  protected override calcVictoryOdds(): void {
    const yesOdds: WheelItem[] = [];
    const noOdds: WheelItem[] = [];

    yesOdds.push({ text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 });

    this.trainerTeam.forEach(pokemon => {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push({ text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 });
      }
    });

    const powerModifier = this.plusModifiers();
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push({ text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 });
    }

    if (this.currentLeader?.types?.length) {
      const { strongCount, weakCount } = this.typeMatchupService.calcTeamMatchup(
        this.trainerTeam,
        this.currentLeader.types
      );
      this.strongCount = strongCount;
      this.weakCount = weakCount;
      this.advantageLabel = this.typeMatchupService.getAdvantageLabel(strongCount, weakCount);

      if (this.advantageLabel === 'overwhelming') {
        for (let i = 0; i < 3; i++) yesOdds.push({ text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 });
      } else if (this.advantageLabel === 'advantage') {
        for (let i = 0; i < 2; i++) yesOdds.push({ text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 });
      } else if (this.advantageLabel === 'disadvantage') {
        const extraNo = weakCount > 3 ? 2 : 1;
        for (let i = 0; i < extraNo; i++) noOdds.push({ text: 'game.main.roulette.gym.no', fillStyle: 'crimson', weight: 1 });
      }

      this.advantageLabelKey = this.advantageLabel
        ? `game.main.roulette.gym.typeAdvantage.${this.advantageLabel}`
        : '';
      const { advantageTypes, disadvantageTypes } = this.typeMatchupService.getMatchupTypes(
        this.trainerTeam,
        this.currentLeader.types
      );
      this.matchupAdvantageTypes = advantageTypes;
      this.matchupDisadvantageTypes = disadvantageTypes;
    } else {
      this.advantageLabel = null;
      this.advantageLabelKey = '';
      this.strongCount = 0;
      this.weakCount = 0;
      this.matchupAdvantageTypes = [];
      this.matchupDisadvantageTypes = [];
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push({ text: 'game.main.roulette.gym.no', fillStyle: 'crimson', weight: 1 });
    }
    // Gym battles should start with 1 noOdds
    noOdds.push({ text: 'game.main.roulette.gym.no', fillStyle: 'crimson', weight: 1 });

    this.victoryOdds = interleaveOdds(yesOdds, noOdds);
  }

  private getCurrentLeader(): void {
    this.currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];

    if ((this.generation.id === 5 && (this.currentRound === 0 || this.currentRound === 7))
      || (this.generation.id === 7 && (this.currentRound === 2 || this.currentRound === 4))
      || (this.generation.id === 8 && (this.currentRound === 3 || this.currentRound === 5))) {

      const leaderTypes = Array.isArray(this.currentLeader.types) ? this.currentLeader.types : undefined;

      this.translate.get(this.currentLeader.name).pipe(take(1)).subscribe(translated => {
        const leaderNames = translated.split('/');
        const leaderSprites = Array.isArray(this.currentLeader.sprite) ? this.currentLeader.sprite : [this.currentLeader.sprite];
        const leaderQuotes = Array.isArray(this.currentLeader.quotes) ? this.currentLeader.quotes : this.currentLeader.quotes;
        const randomIndex = Math.floor(Math.random() * leaderNames.length);

        this.fromLeaderChange.emit(randomIndex);

        this.currentLeader = {
          name: leaderNames[randomIndex],
          sprite: leaderSprites[randomIndex],
          quotes: [Array.isArray(leaderQuotes) ? leaderQuotes[randomIndex] : leaderQuotes],
          types: leaderTypes ? [leaderTypes[randomIndex]] : undefined
        } as GymLeader;

        this.calcVictoryOdds();
      });
    }
  }
}