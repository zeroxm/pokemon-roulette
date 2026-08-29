import { Directive, OnInit, OnDestroy, inject } from '@angular/core';
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
import { PokemonType, pokemonTypeDataByKey } from '../../../../interfaces/pokemon-type';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { interleaveOdds } from '../../../../utils/odd-utils';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component';
import { MegaEvolutionAnimationModalComponent } from '../mega-evolution-animation-modal/mega-evolution-animation-modal.component';
import { SettingsService } from '../../../../services/settings-service/settings.service';

/** Greninja's base and Ash form ids, for the transformation animation. */
const GRENINJA_BASE_ID = 658;
const ASH_GRENINJA_ID = 10117;

@Directive()
export abstract class BaseBattleRouletteComponent implements OnInit, OnDestroy {
  protected generation!: GenerationItem;
  protected trainerTeam!: PokemonItem[];
  protected trainerItems!: ItemItem[];
  protected currentItem!: ItemItem;
  /**
   * Translation key naming *why* the player gets another spin, shown beside the retry count.
   *
   * Separate from `currentItem` because a retry is no longer always an item — Mimikyu's Disguise
   * grants one too. The templates used to read `currentItem.text` directly, which threw the moment
   * anything other than a potion set `retries`.
   */
  protected respinReasonKey: string | null = null;
  protected retries = 0;

  // Injected rather than added to the constructor: four components extend this, one of them the
  // rival battle, which has no retry mechanic and no reason to grow parameters for it.
  private readonly modalQueue = inject(ModalQueueService);
  private readonly settings = inject(SettingsService);
  protected victoryOdds: WheelItem[] = [];

  /** Key prefix for this battle's outcome labels, e.g. `game.main.roulette.gym`. */
  protected abstract readonly outcomeKeyPrefix: string;
  /**
   * Losing slices every battle of this kind starts with, before round progression.
   * Gym 1, Elite Four 2, Champion 3 — the difficulty curve, in one place.
   */
  protected abstract readonly baseNoOdds: number;

  /** Type-matchup display state. Only battles that know their opponent's types populate it. */
  strongCount = 0;
  weakCount = 0;
  advantageLabel: 'overwhelming' | 'advantage' | 'disadvantage' | null = null;
  advantageLabelKey = '';
  matchupAdvantageTypes: PokemonType[] = [];
  matchupDisadvantageTypes: PokemonType[] = [];

  /**
   * Round the player has reached; drives how many losing slices accumulate.
   * Each subclass declares it as an `@Input`, so it is abstract here.
   */
  abstract currentRound: number;

  protected readonly typeIconBaseUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

  /** Icons are keyed by the type's numeric id, not its name. */
  getTypeIconUrl(type: PokemonType): string {
    return `${this.typeIconBaseUrl}/${pokemonTypeDataByKey[type].id}.png`;
  }

  private gameSubscription: Subscription | null = null;
  private generationSubscription: Subscription | null = null;
  private teamSubscription: Subscription | null = null;

  constructor(
    protected readonly modalService: NgbModal,
    protected readonly gameStateService: GameStateService,
    protected readonly generationService: GenerationService,
    protected readonly trainerService: TrainerService,
    protected readonly translate: TranslateService,
    protected readonly typeMatchupService: TypeMatchupService,
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

  /**
   * Extra winning slices from held X-Attacks: each grants the team's mean power.
   *
   * The empty-team guard matters — dividing by zero produced NaN, and the loop that consumes this
   * (`i < NaN` is false) then dropped the bonus silently rather than failing. The result is
   * Rounding is **up**, made explicit here. The consuming loop used `i < meanPower` on a
   * fractional value, which ran the extra iteration — so 2.4 gave 3 slices. That is preserved
   * rather than "corrected", since it is a balance decision, not a defect.
   */
  protected plusModifiers(): number {
    if (this.trainerTeam.length === 0) {
      return 0;
    }

    const xAttackCount = this.trainerItems.filter(item => item.name === 'x-attack').length;
    const meanPower = this.trainerTeam.reduce((sum, pokemon) => sum + pokemon.power, 0) / this.trainerTeam.length;

    return Math.ceil(xAttackCount * meanPower);
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
    this.respinReasonKey = potion.text;
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
    void this.transformAshGreninja();
  }

  /**
   * Ash-Greninja: a hidden reward for a battle that went badly enough to need a potion.
   *
   * Deliberately unannounced — no wheel slice, no hint, no stone. It fires straight off `usePotion`,
   * so all three battle types get it, and the transformation queues behind the "used an item" modal
   * rather than fighting it for the screen.
   *
   * Reuses the mega-evolution animation, including its opt-out: a player who has turned that off
   * gets the form change without the cutscene, exactly as they would for a mega.
   */
  private async transformAshGreninja(): Promise<void> {
    if (!this.trainerService.hasBaseGreninja() || !this.trainerService.transformAshGreninja()) {
      return;
    }

    if (this.settings.currentSettings.skipMegaEvolutionAnimation) {
      return;
    }

    const animation = await this.modalQueue.open(MegaEvolutionAnimationModalComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    animation.componentInstance.pokemonId = GRENINJA_BASE_ID;
    animation.componentInstance.megaPokemonId = ASH_GRENINJA_ID;
  }

  /**
   * Whether the Disguise has already absorbed a defeat in *this* battle.
   *
   * A component field rather than a run modifier, because the limit is per battle: the container
   * renders battle roulettes from an `@switch`, so leaving the battle state destroys this component
   * and the next battle starts with a fresh, unspent disguise. Tracking it separately from the
   * Pokémon's own form matters because a second Mimikyu caught mid-battle would otherwise be a
   * second free retry in the same fight.
   */
  private disguiseUsedThisBattle = false;

  /**
   * Mimikyu's Disguise: a last-resort retry once the potions are gone.
   *
   * Three conditions, all required — an undisguised Mimikyu on the team, no potion left (checked by
   * the caller, which reaches here only when `hasPotions()` came back empty), and the Disguise
   * unspent in this battle.
   */
  protected hasDisguise(): boolean {
    return !this.disguiseUsedThisBattle && this.trainerService.hasDisguisedMimikyu();
  }

  /**
   * Busts the disguise and grants exactly one retry — the same thing a plain Potion grants.
   *
   * The flag is only set when the form change actually happened, so a bust that found nothing to
   * change cannot silently spend this battle's use.
   */
  protected useDisguise(openDisguiseModal: () => void): boolean {
    if (!this.trainerService.bustMimikyuDisguise()) {
      return false;
    }

    this.disguiseUsedThisBattle = true;
    this.respinReasonKey = 'game.main.roulette.disguise.respin';
    this.retries = 1;
    openDisguiseModal();
    return true;
  }

  /** The "your disguise broke" notice. Here rather than per battle type so the copy exists once. */
  protected openDisguiseNotice(): void {
    void this.modalQueue
      .open(InfoModalComponent, { centered: true, size: 'md' })
      .then(ref => {
        ref.componentInstance.title = this.translate.instant('game.main.roulette.disguise.title');
        ref.componentInstance.message = this.translate.instant('game.main.roulette.disguise.message');
      });
  }

  /** Called for every game state change. Subclass checks its own trigger state. */
  protected abstract onGameStateChange(state: string): void | Promise<void>;

  /** Rebuilds victoryOdds from current team, items, and opponent data. */
  protected abstract calcVictoryOdds(): void;

  /**
   * Builds the win/lose wheel.
   *
   * Every battle roulette had its own copy of this; gym and elite-four were the same sixty lines
   * differing only in a translation key and how many losing slices to start with.
   *
   * Pass `opponentTypes` to fold type matchup in — that also populates the display fields above.
   * Omit it and the matchup state resets, which is what the battles that do not know their
   * opponent's types want.
   */
  protected buildVictoryOdds(opponentTypes?: PokemonType[]): WheelItem[] {
    const win = (): WheelItem => ({ text: `${this.outcomeKeyPrefix}.yes`, fillStyle: 'green', weight: 1 });
    const lose = (): WheelItem => ({ text: `${this.outcomeKeyPrefix}.no`, fillStyle: 'crimson', weight: 1 });

    const yesOdds: WheelItem[] = [win()];
    const noOdds: WheelItem[] = [];

    for (const pokemon of this.trainerTeam) {
      for (let i = 0; i < pokemon.power; i++) {
        yesOdds.push(win());
      }
    }

    const powerModifier = this.plusModifiers();
    for (let i = 0; i < powerModifier; i++) {
      yesOdds.push(win());
    }

    if (opponentTypes?.length) {
      const { strongCount, weakCount } = this.typeMatchupService.calcTeamMatchup(this.trainerTeam, opponentTypes);
      this.strongCount = strongCount;
      this.weakCount = weakCount;
      this.advantageLabel = this.typeMatchupService.getAdvantageLabel(strongCount, weakCount);

      if (this.advantageLabel === 'overwhelming') {
        for (let i = 0; i < 3; i++) yesOdds.push(win());
      } else if (this.advantageLabel === 'advantage') {
        for (let i = 0; i < 2; i++) yesOdds.push(win());
      } else if (this.advantageLabel === 'disadvantage') {
        const extraNo = weakCount > 3 ? 2 : 1;
        for (let i = 0; i < extraNo; i++) noOdds.push(lose());
      }

      this.advantageLabelKey = this.advantageLabel
        ? `${this.outcomeKeyPrefix}.typeAdvantage.${this.advantageLabel}`
        : '';
      const { advantageTypes, disadvantageTypes } =
        this.typeMatchupService.getMatchupTypes(this.trainerTeam, opponentTypes);
      this.matchupAdvantageTypes = advantageTypes;
      this.matchupDisadvantageTypes = disadvantageTypes;
    } else {
      this.resetMatchupState();
    }

    for (let index = 0; index < this.currentRound; index++) {
      noOdds.push(lose());
    }
    for (let i = 0; i < this.baseNoOdds; i++) {
      noOdds.push(lose());
    }

    return interleaveOdds(yesOdds, noOdds);
  }

  private resetMatchupState(): void {
    this.advantageLabel = null;
    this.advantageLabelKey = '';
    this.strongCount = 0;
    this.weakCount = 0;
    this.matchupAdvantageTypes = [];
    this.matchupDisadvantageTypes = [];
  }
}
