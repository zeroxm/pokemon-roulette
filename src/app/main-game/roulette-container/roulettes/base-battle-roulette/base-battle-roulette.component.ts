import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { ItemItem } from '../../../../interfaces/item-item';
import { WheelItem } from '../../../../interfaces/wheel-item';

export abstract class BaseBattleRouletteComponent implements OnInit, OnDestroy {
  protected generation!: GenerationItem;
  protected trainerTeam!: PokemonItem[];
  protected trainerItems!: ItemItem[];
  protected currentItem!: ItemItem;
  protected retries = 0;
  protected victoryOdds: WheelItem[] = [];

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;
  private teamSubscription!: Subscription;

  constructor(
    protected readonly modalService: NgbModal,
    protected readonly gameStateService: GameStateService,
    protected readonly generationService: GenerationService,
    protected readonly trainerService: TrainerService,
    protected readonly translate: TranslateService
  ) {}

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
      this.onGameStateChange(state);
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

  protected plusModifiers(): number {
    let power = 0;
    const xAttacks = this.trainerItems.filter(item => item.name === 'x-attack');
    xAttacks.forEach(() => {
      const meanPower = this.trainerTeam.reduce((sum, pokemon) => sum + pokemon.power, 0) / this.trainerTeam.length;
      power += meanPower;
    });
    return power;
  }

  protected hasPotions(): ItemItem | undefined {
    return this.trainerItems.find(item =>
      item.name === 'potion' || item.name === 'super-potion' || item.name === 'hyper-potion'
    );
  }

  /**
   * Removes the potion from the trainer's inventory, sets retries, then invokes
   * the caller-supplied modal opener. The lambda is provided by the subclass so
   * that gym/elite-four can use ModalQueueService while champion uses NgbModal directly.
   */
  protected usePotion(potion: ItemItem, openItemUsedModal: () => void): void {
    const index = this.trainerItems.indexOf(potion);
    this.currentItem = potion;
    if (index !== -1) {
      this.trainerItems.splice(index, 1);
      this.trainerService.removeItem(potion);
    }
    switch (potion.name) {
      case 'potion': this.retries = 1; break;
      case 'super-potion': this.retries = 2; break;
      case 'hyper-potion': this.retries = 3; break;
    }
    openItemUsedModal();
  }

  /** Called for every game state change. Subclass checks its own trigger state. */
  protected abstract onGameStateChange(state: string): void;

  /** Rebuilds victoryOdds from current team, items, and opponent data. */
  protected abstract calcVictoryOdds(): void;
}
