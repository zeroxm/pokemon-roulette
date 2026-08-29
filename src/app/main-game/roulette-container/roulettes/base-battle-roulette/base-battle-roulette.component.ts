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
   * Separate from `currentItem` because a retry is not always an item — Mimikyu's Disguise grants
   * one too.
   */
  protected respinReasonKey: string | null = null;
  protected retries = 0;

  // Injected rather than constructor-passed, so the four subclasses keep their signatures.
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
   * Two things are deliberate. The empty-team guard avoids a division by zero, whose NaN would make
   * the consuming loop drop the bonus silently rather than fail. And rounding is **up**: 2.4 mean
   * power gives 3 slices, which is a balance decision rather than an accident of arithmetic.
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
   * Spends a potion: removes it, sets the retries it grants, and opens the caller's "used an item"
   * modal. Also the trigger for Ash-Greninja.
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
   * Ash-Greninja: a hidden reward for a battle that needed a potion.
   *
   * Deliberately unannounced — no wheel slice, no hint, no stone. Fires off `usePotion`, so all
   * three battle types get it, and queues behind the "used an item" modal. Reuses the
   * mega-evolution animation and its skip setting.
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
   * A component field, not a run modifier: the container renders battle roulettes from an
   * `@switch`, so each battle gets a fresh instance and a fresh disguise. Tracked separately from
   * the Pokémon's own form, so a second Mimikyu caught mid-battle is not a second free retry.
   */
  private disguiseUsedThisBattle = false;

  /**
   * Mimikyu's Disguise: a last-resort retry once the potions are gone. Requires an undisguised
   * Mimikyu on the team and the Disguise unspent this battle; the caller only reaches here when
   * `hasPotions()` came back empty.
   */
  protected hasDisguise(): boolean {
    return !this.disguiseUsedThisBattle && this.trainerService.hasDisguisedMimikyu();
  }

  /**
   * Busts the disguise and grants one retry, as a plain Potion would. The flag is set only when the
   * form actually changed, so a no-op bust cannot spend this battle's use.
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
   * Builds the win/lose wheel for every battle type, parameterised by `outcomeKeyPrefix` and
   * `baseNoOdds`.
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
