import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GenerationRouletteComponent } from "./roulettes/generation-roulette/generation-roulette.component";
import { GameStateService } from '../../services/game-state-service/game-state.service';
import { GameState } from '../../services/game-state-service/game-state';
import { EventSource } from '../EventSource';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { ItemsService } from '../../services/items-service/items.service';
import { EvolutionService } from '../../services/evolution-service/evolution.service';
import { CommonModule } from '@angular/common';
import { SoundFxHandle, SoundFxService } from '../../services/sound-fx-service/sound-fx.service';
import { SettingsService } from '../../services/settings-service/settings.service';
import { RareCandyService } from '../../services/rare-candy-service/rare-candy.service';
import { Subscription } from 'rxjs';
import { CharacterSelectComponent } from "./roulettes/character-select/character-select.component";
import { StarterRouletteComponent } from "./roulettes/starter-roulette/starter-roulette.component";
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonForm } from '../../interfaces/pokemon-form';
import { ItemItem } from '../../interfaces/item-item';
import { ShinyRouletteComponent } from "./roulettes/shiny-roulette/shiny-roulette.component";
import { StartAdventureRouletteComponent } from "./roulettes/start-adventure-roulette/start-adventure-roulette.component";
import { ItemName } from '../../services/items-service/item-names';
import { PokemonFromGenerationRouletteComponent } from "./roulettes/pokemon-from-generation-roulette/pokemon-from-generation-roulette.component";
import { PokemonFromAuxListRouletteComponent } from "./roulettes/pokemon-from-aux-list-roulette/pokemon-from-aux-list-roulette.component";
import { GymBattleRouletteComponent } from "./roulettes/gym-battle-roulette/gym-battle-roulette.component";
import { CheckEvolutionRouletteComponent } from "./roulettes/check-evolution-roulette/check-evolution-roulette.component";
import { MainAdventureRouletteComponent } from "./roulettes/main-adventure-roulette/main-adventure-roulette.component";
import { TeamRocketRouletteComponent } from "./roulettes/team-rocket-roulette/team-rocket-roulette.component";
import { MysteriousEggRouletteComponent } from "./roulettes/mysterious-egg-roulette/mysterious-egg-roulette.component";
import { LegendaryRouletteComponent } from "./roulettes/legendary-roulette/legendary-roulette.component";
import { CatchLegendaryRouletteComponent } from "./roulettes/catch-legendary-roulette/catch-legendary-roulette.component";
import { SelectFormRouletteComponent } from './roulettes/select-form-roulette/select-form-roulette.component';
import { TradePokemonRouletteComponent } from "./roulettes/trade-pokemon-roulette/trade-pokemon-roulette.component";
import { FindItemRouletteComponent } from "./roulettes/find-item-roulette/find-item-roulette.component";
import { ExploreCaveRouletteComponent } from "./roulettes/explore-cave-roulette/explore-cave-roulette.component";
import { CavePokemonRouletteComponent } from "./roulettes/cave-pokemon-roulette/cave-pokemon-roulette.component";
import { FossilRouletteComponent } from "./roulettes/fossil-roulette/fossil-roulette.component";
import { AreaZeroRoulette } from "./roulettes/area-zero-roulette/area-zero-roulette";
import { CatchParadoxRouletteComponent } from "./roulettes/catch-paradox-roulette/catch-paradox-roulette.component";
import { SnorlaxRouletteComponent } from "./roulettes/snorlax-roulette/snorlax-roulette.component";
import { FishingRouletteComponent } from "./roulettes/fishing-roulette/fishing-roulette.component";
import { RivalBattleRouletteComponent } from "./roulettes/rival-battle-roulette/rival-battle-roulette.component";
import { EliteFourPrepRouletteComponent } from "./roulettes/elite-four-prep-roulette/elite-four-prep-roulette.component";
import { EliteFourBattleRouletteComponent } from "./roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component";
import { ChampionBattleRouletteComponent } from "./roulettes/champion-battle-roulette/champion-battle-roulette.component";
import { EndGameComponent } from "../end-game/end-game.component";
import { GameOverComponent } from "../game-over/game-over.component";
import { ModalQueueService } from '../../services/modal-queue-service/modal-queue.service';
import { PokemonFormsService } from '../../services/pokemon-forms-service/pokemon-forms.service';

@Component({
  selector: 'app-roulette-container',
  imports: [
    CommonModule,
    TranslatePipe,
    GenerationRouletteComponent,
    CharacterSelectComponent,
    StarterRouletteComponent,
    ShinyRouletteComponent,
    StartAdventureRouletteComponent,
    PokemonFromGenerationRouletteComponent,
    PokemonFromAuxListRouletteComponent,
    SelectFormRouletteComponent,
    GymBattleRouletteComponent,
    CheckEvolutionRouletteComponent,
    MainAdventureRouletteComponent,
    TeamRocketRouletteComponent,
    MysteriousEggRouletteComponent,
    LegendaryRouletteComponent,
    CatchLegendaryRouletteComponent,
    TradePokemonRouletteComponent,
    FindItemRouletteComponent,
    ExploreCaveRouletteComponent,
    CavePokemonRouletteComponent,
    FossilRouletteComponent,
    AreaZeroRoulette,
    CatchParadoxRouletteComponent,
    SnorlaxRouletteComponent,
    FishingRouletteComponent,
    RivalBattleRouletteComponent,
    EliteFourPrepRouletteComponent,
    EliteFourBattleRouletteComponent,
    ChampionBattleRouletteComponent,
    EndGameComponent,
    GameOverComponent
],
  templateUrl: './roulette-container.component.html',
  styleUrl: './roulette-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouletteContainerComponent implements OnInit, OnDestroy {

    NINCADA_ID = 290;
    @Output() resetGameEvent = new EventEmitter<void>();

    private rareCandySubscription?: Subscription;

    constructor(
      private evolutionService: EvolutionService,
      private gameStateService: GameStateService,
      private itemService: ItemsService,
      private pokemonService: PokemonService,
      private translateService: TranslateService,
      private trainerService: TrainerService,
      private modalService: NgbModal,
      private modalQueueService: ModalQueueService,
      private soundFxService: SoundFxService,
      private settingsService: SettingsService,
      private pokemonFormsService: PokemonFormsService,
      private rareCandyService: RareCandyService,
      private cdr: ChangeDetectorRef) {
      this.itemFoundAudio = this.soundFxService.createItemFoundSoundFx();
    }

    ngOnInit(): void {
      this.gameStateService.currentState.subscribe(state => {
        this.currentGameState = state;
        if (this.currentGameState === 'adventure-continues') {
          if (this.multitaskCounter > 0) {
            this.respinReason = 'Multitask x' + this.multitaskCounter;
            this.multitaskCounter--;
          }
          if (this.runningShoesUsed) {
            this.respinReason = 'items.running-shoes.name';
          }
        }
        this.cdr.markForCheck();
      });

    this.gameStateService.currentRoundObserver.subscribe(round => {
      this.leadersDefeatedAmount = round;
      this.cdr.markForCheck();
    });

    this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
      this.cdr.markForCheck();
    });

    // Subscribe to rare candy evolution trigger
    this.rareCandySubscription = this.rareCandyService.rareCandyTrigger$.subscribe((rareCandy) => {
      this.handleRareCandyEvolution(rareCandy);
    });
  }

  ngOnDestroy(): void {
    this.rareCandySubscription?.unsubscribe();
  }

  handleRareCandyEvolution(rareCandy: ItemItem): void {
    const pokemonThatCanEvolve = this.trainerService.getPokemonThatCanEvolve();

    if (pokemonThatCanEvolve.length > 0) {
      this.gameStateService.repeatCurrentState();
      this.trainerService.removeItem(rareCandy);
      this.chooseWhoWillEvolve('rare-candy');
    }
  }

  @ViewChild('altPrizeModal', { static: true }) altPrizeModal!: TemplateRef<any>;
  @ViewChild('infoModal', { static: true }) infoModal!: TemplateRef<any>;
  @ViewChild('itemActivateModal', { static: true }) itemActivateModal!: TemplateRef<any>;
  @ViewChild('pkmnEvoModal', { static: true }) pkmnEvoModal!: TemplateRef<any>;
  @ViewChild('pkmnTradeModal', { static: true }) pkmnTradeModal!: TemplateRef<any>;
  @ViewChild('teamRocketFailsModal', { static: true }) teamRocketFailsModal!: TemplateRef<any>;
  @ViewChild('faintedModal', { static: true }) faintedModal!: TemplateRef<any>;
  @ViewChild('resumeGameModal', { static: true }) resumeGameModal!: TemplateRef<any>;

  altPrizeDescription = '';
  altPrizeSprite = '';
  altPrizeText = '';
  auxPokemonList: PokemonItem[] = [];
  pokemonForms: PokemonForm[] = [];
  currentContextItem!: ItemItem;
  currentContextPokemon!: PokemonItem;
  currentGameState!: GameState;
  customWheelTitle = '';
  evolutionCredits: number = 0;
  expSharePokemon: PokemonItem | null = null;
  expShareUsed: boolean = false;
  fromLeader: number = 0;
  infoModalMessage = '';
  infoModalTitle = '';
  itemFoundAudio!: SoundFxHandle;
  leadersDefeatedAmount: number = 0;
  multitaskCounter: number = 0;
  pkmnEvoTitle = '';
  pkmnIn!: PokemonItem;
  pkmnOut!: PokemonItem;
  pkmnTradeTitle = '';
  respinReason = '';
  runningShoesUsed: boolean = false;
  stolenPokemon!: PokemonItem | null;
  wheelSpinning: boolean = false;

  // Feature 8: Streak tracker
  catchStreak: number = 0;

  // Feature 5: Nuzlocke
  faintedPokemonName: string = '';

  getGameState(): string {
    return this.currentGameState;
  }

  // Feature 1: Resume game
  hasSavedGame(): boolean {
    return this.gameStateService.hasSave() && this.trainerService.hasSave();
  }

  continueGame(): void {
    this.trainerService.loadFromSave();
    this.gameStateService.loadFromSave();
    this.cdr.markForCheck();
  }

  newGame(): void {
    this.gameStateService.clearSave();
    this.trainerService.clearSave();
    this.gameStateService.resetGameState();
    this.cdr.markForCheck();
  }

  private finishCurrentState(): void {

    this.gameStateService.finishCurrentState();

    if (this.currentGameState === 'adventure-continues') {
      if (this.trainerService.hasItem('running-shoes') && !this.runningShoesUsed) {
        this.runningShoesUsed = true;
        this.gameStateService.setNextState('adventure-continues');
      }
    }
  }

  handleGenerationSelected(): void {
    this.finishCurrentState();
  }

  handleTrainerSelected(): void {
    this.finishCurrentState();
  }

  capturePokemon(pokemon: PokemonItem): void {
    // Feature 4: Play cry on reveal
    void this.soundFxService.playPokemonCry(pokemon.pokemonId);
    this.preparePokemonCapture(pokemon);
  }

  setShininess(shiny: boolean): void {
    if (shiny) {
      this.trainerService.makeShiny();
    }
    this.finishCurrentState();
  }

  catchPokemon(): void {
    this.catchStreak++;
    this.gameStateService.setNextState('catch-pokemon');
    this.finishCurrentState();
  }

  chooseWhoWillEvolve(eventSource: EventSource): void {
    this.auxPokemonList = [];

    this.auxPokemonList = this.trainerService.getPokemonThatCanEvolve();

    if (this.auxPokemonList.length === 0) {
      switch (eventSource) {
        case 'gym-battle':
          this.altPrizeText = 'game.main.altPrizes.gymBattle.potion';
          this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png';
          this.altPrizeDescription = 'game.main.altPrizes.gymBattle.potionDesc';
          this.modalQueueService.open(this.altPrizeModal, {
            centered: true,
            size: 'md'
          });
          return this.buyPotions();
          break;
        case 'visit-daycare':
            this.altPrizeText = 'game.main.altPrizes.visitDaycare.egg';
            this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/mystery-egg.png';
            this.altPrizeDescription = 'game.main.altPrizes.visitDaycare.eggDesc';
            this.modalQueueService.open(this.altPrizeModal, {
              centered: true,
              size: 'md'
            });
            return this.mysteriousEgg();
            break;
        case 'battle-rival':
          this.altPrizeText = 'game.main.altPrizes.battleRival.item';
          this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';
          this.altPrizeDescription = 'game.main.altPrizes.battleRival.itemDesc';
          this.modalQueueService.open(this.altPrizeModal, {
            centered: true,
            size: 'md'
          });
          return this.findItem();
          break;
        case 'battle-trainer':
          this.altPrizeText = 'game.main.altPrizes.battleTrainer.potion';
          this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png';
          this.altPrizeDescription = 'game.main.altPrizes.battleTrainer.potionDesc';
          this.modalQueueService.open(this.altPrizeModal, {
            centered: true,
            size: 'md'
          });
          return this.buyPotions();
          break;
        case 'team-rocket-encounter':
          this.altPrizeText = 'game.main.altPrizes.teamRocket.item';
          this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';
          this.altPrizeDescription = 'game.main.altPrizes.teamRocket.itemDesc';
          this.modalQueueService.open(this.altPrizeModal, {
            centered: true,
            size: 'md'
          });
          return this.findItem();
          break;
        case 'snorlax-encounter':
          this.altPrizeText = 'game.main.altPrizes.snorlax.item';
          this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';
          this.altPrizeDescription = 'game.main.altPrizes.snorlax.itemDesc';
          this.modalQueueService.open(this.altPrizeModal, {
            centered: true,
            size: 'md'
          });
          return this.findItem();
          break;
        case 'rare-candy':
          return this.doNothing();
          break;
        default:
          return this.doNothing();
          break;
      }
    }

    if (this.auxPokemonList.length === 1) {
      return this.evolvePokemon(this.auxPokemonList[0]);
    }

    this.customWheelTitle = 'game.main.roulette.evolve.who';
    this.gameStateService.setNextState('evolve-pokemon');
    this.gameStateService.setNextState('select-from-pokemon-list');

    this.finishCurrentState();
  }

  buyPotions(): void {
    this.catchStreak = 0;
    let itemName: ItemName = 'potion';

    if (this.leadersDefeatedAmount > 6) {
      itemName = 'hyper-potion';
    } else if (this.leadersDefeatedAmount > 3) {
      itemName = 'super-potion';
    }

    this.trainerService.addToItems(this.itemService.getItem(itemName));
    this.playItemFoundAudio();
    this.finishCurrentState();
  }

  doNothing(): void {
    this.catchStreak = 0;
    this.finishCurrentState();
  }

  mysteriousEgg(): void {
    this.gameStateService.setNextState('mysterious-egg');
    this.finishCurrentState();
  }

  findItem(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('find-item');
    this.finishCurrentState();
  }

  continueWithPokemon(pokemon: PokemonItem): void {
    this.finishCurrentState();
    switch (this.currentGameState) {
      case 'evolve-pokemon':
        this.evolvePokemon(pokemon);
        break;
      case 'select-evolution':
        this.replaceForEvolution(this.currentContextPokemon, pokemon);
        this.showpkmnEvoModal();
        break;
      case 'steal-pokemon':
        this.stolenPokemon = pokemon;
        this.removeFromTeam(pokemon);
        this.finishCurrentState();
        break;
      case 'trade-pokemon':
        this.currentContextPokemon = pokemon;
        break;
      default:
        break;
    }
  }

  selectPokemonForm(pokemonForm: PokemonForm): void {
    this.currentContextPokemon = this.pokemonFormsService.applyFormToPokemon(this.currentContextPokemon, pokemonForm);
    this.completePokemonCapture(this.currentContextPokemon);
  }

  secondEvolution(): void {
    this.auxPokemonList = [];

    this.auxPokemonList = this.trainerService.getPokemonThatCanEvolve();

    if (this.expSharePokemon) {
      const index = this.auxPokemonList.indexOf(this.expSharePokemon);
      if (index > -1) {
        this.auxPokemonList.splice(index, 1);
      }
    }

    if (this.auxPokemonList.length === 0) {
      return;
    }

    if (this.auxPokemonList.length === 1) {
      return this.evolveSecondPokemon(this.auxPokemonList[0]);
    }

    this.customWheelTitle = 'game.main.roulette.evolve.whoExpShare';
    this.gameStateService.setNextState('evolve-pokemon');
    this.gameStateService.setNextState('select-from-pokemon-list');
  }

  gymBattleResult(result: boolean): void {
    this.runningShoesUsed = false;
    this.respinReason = '';
    this.catchStreak = 0;

    if (result) {
      this.playItemFoundAudio();
      this.trainerService.addBadge(this.leadersDefeatedAmount, this.fromLeader);
      this.gameStateService.advanceRound();
      this.gameStateService.incrementRivalLevel();
      this.gameStateService.setNextState('check-evolution');
    } else {
      this.handleBattleLoss();
      return;
    }

    this.finishCurrentState();
  }

  catchTwoPokemon(): void {
    this.catchStreak += 2;
    this.gameStateService.setNextState('catch-pokemon');
    this.gameStateService.setNextState('catch-pokemon');
    this.finishCurrentState();
  }

  teamRocketEncounter(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('team-rocket-encounter');
    this.finishCurrentState();
  }

  legendaryEncounter(): void {
    this.gameStateService.setNextState('legendary-encounter');
    this.finishCurrentState();
  }

  tradePokemon(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('trade-pokemon');

    const trainerTeam = this.trainerService.getTeam();

    if (trainerTeam.length === 1) {
      this.currentContextPokemon = trainerTeam[0];
    } else {
      this.auxPokemonList = trainerTeam;
      this.customWheelTitle = 'game.main.roulette.trade.which';
      this.gameStateService.setNextState('select-from-pokemon-list');
    }

    this.finishCurrentState();
  }

  exploreCave(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('explore-cave');
    this.finishCurrentState();
  }

  snorlaxEncounter(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('snorlax-encounter');
    this.finishCurrentState();
  }

  multitask(): void {
    this.gameStateService.setNextState('adventure-continues');
    this.gameStateService.setNextState('adventure-continues');
    this.multitaskCounter = this.multitaskCounter + 2;
    this.respinReason = 'Multitask x' + this.multitaskCounter;
    this.finishCurrentState();
  }

  goFishing(): void {
    this.catchStreak++;
    this.gameStateService.setNextState('go-fishing');
    this.finishCurrentState();
  }

  findFossil(): void {
    this.catchStreak++;
    this.gameStateService.setNextState('find-fossil');
    this.finishCurrentState();
  }

  areaZero(): void {
    this.gameStateService.setNextState('area-zero');
    this.finishCurrentState();
  }

  paradoxCaptureChance(pokemon: PokemonItem): void {
    this.currentContextPokemon = structuredClone(pokemon);
    this.gameStateService.setNextState('catch-paradox');
    this.finishCurrentState();
  }

  paradoxCaptureSuccess(): void {
    this.preparePokemonCapture(this.currentContextPokemon);
  }

  battleRival(): void {
    this.catchStreak = 0;
    this.gameStateService.setNextState('battle-rival');
    this.finishCurrentState();
  }

  rivalBattleResult(result: boolean): void {
    if (result) {
      this.chooseWhoWillEvolve('battle-rival');
    } else {
      this.handleBattleLoss();
    }
  }

  stealPokemon(): void {
    const trainerTeam = this.trainerService.getTeam();

    if (trainerTeam.length < 2) {
      this.modalQueueService.open(this.teamRocketFailsModal, {
        centered: true,
        size: 'md'
      }).then(modalRef => {
        modalRef.result.then(() => {
          return this.doNothing();
        }, () => {
          return this.doNothing();
        });
      });
    } else if (this.trainerService.hasItem('escape-rope')) {
      this.useEscapeRope();
    } else {
      this.auxPokemonList = trainerTeam;
      this.customWheelTitle = 'game.main.roulette.teamrocket.steal.which';
      this.gameStateService.setNextState('steal-pokemon');
      this.gameStateService.setNextState('select-from-pokemon-list');
      this.finishCurrentState();
    }
  }

  teamRocketDefeated(): void {
    if (this.stolenPokemon) {
      const pokemonName = this.translateService.instant(this.stolenPokemon.text);

      this.trainerService.addToTeam(this.stolenPokemon);
      this.infoModalTitle = this.translateService.instant('game.main.roulette.teamrocket.saved.title ') + pokemonName + '!';
      this.infoModalMessage = this.translateService.instant('game.main.roulette.teamrocket.saved.recovered') + pokemonName + ' ' + this.translateService.instant('game.main.roulette.teamrocket.saved.from');
      this.stolenPokemon = null;
      this.modalQueueService.open(this.infoModal, {
        centered: true,
        size: 'md'
      });
    }

    this.chooseWhoWillEvolve('team-rocket-encounter');
  }

  legendaryCaptureChance(pokemon: PokemonItem): void {
    this.currentContextPokemon = structuredClone(pokemon);
    this.gameStateService.setNextState('catch-legendary');
    this.finishCurrentState();
  }

  legendaryCaptureSuccess(): void {
    this.preparePokemonCapture(this.currentContextPokemon);
  }

  performTrade(pokemon: PokemonItem): void {
    this.pkmnIn = structuredClone(pokemon);;
    this.pkmnOut = this.currentContextPokemon;
    this.pkmnTradeTitle = "Trade!";
    this.trainerService.performTrade(this.currentContextPokemon, this.pkmnIn);
    this.auxPokemonList = [];
    this.playItemFoundAudio();
    if (!this.settingsService.currentSettings.lessExplanations) {
      this.modalQueueService.open(this.pkmnTradeModal, {
        centered: true,
        size: 'md'
      }).then(modalRef => {
        modalRef.result.then(() => {
          this.finishCurrentState();
        }, () => {
          this.finishCurrentState();
        });
      });
    } else {
      this.finishCurrentState();
    }
  }

  receiveItem(item: ItemItem): void {
    this.catchStreak = 0;
    this.trainerService.addToItems(item);
    this.finishCurrentState();
  }

  catchCavePokemon(): void {
    this.catchStreak++;
    this.gameStateService.setNextState('catch-cave-pokemon');
    this.finishCurrentState();
  }

  getLost(): void {
    if (this.trainerService.hasItem('escape-rope')) {
      this.useEscapeRope();
    } else {
      return this.doNothing();
    }
  }

  catchZubat(): void {
    const zubat = this.pokemonService.getPokemonById(41);
    if (zubat) {
      this.preparePokemonCapture(zubat);
      return;
    }
    this.finishCurrentState();
  }

  catchSnorlax(): void {
    const snorlax = this.pokemonService.getPokemonById(143);
    if (snorlax) {
      this.preparePokemonCapture(snorlax);
      return;
    }
    this.finishCurrentState();
  }

  eliteFourBattleResult(result: boolean): void {
    this.runningShoesUsed = false;
    this.respinReason = '';

    if (result) {
      this.gameStateService.advanceRound();
      this.gameStateService.setNextState('check-evolution');
    } else {
      this.handleBattleLoss();
      return;
    }
    this.finishCurrentState();
  }

  championBattleResult(result: boolean): void {
    this.runningShoesUsed = false;
    this.respinReason = '';

    if (result) {
      this.gameStateService.advanceRound();
    } else {
      this.handleBattleLoss();
      return;
    }

    this.finishCurrentState();
  }

  // Feature 5: Nuzlocke - centralized battle loss handler
  private handleBattleLoss(): void {
    if (this.settingsService.currentSettings.nuzlockeMode) {
      // In Nuzlocke, use a potion first if available to get another chance
      const potion = this.findPotion();
      if (potion) {
        this.trainerService.removeItem(potion);
        this.finishCurrentState();
        return;
      }
      // No potions left - faint the weakest pokemon
      const fainted = this.trainerService.faintWeakestPokemon();
      if (fainted) {
        this.faintedPokemonName = this.translateService.instant(fainted.text);
        this.modalQueueService.open(this.faintedModal, {
          centered: true,
          size: 'md'
        });
      }
      if (this.trainerService.isWhiteout()) {
        this.gameStateService.setNextState('game-over');
        this.finishCurrentState();
      } else {
        this.finishCurrentState();
      }
    } else {
      this.gameStateService.setNextState('game-over');
      this.finishCurrentState();
    }
  }

  private findPotion(): ItemItem | undefined {
    const items = this.trainerService.getItems();
    return items.find(item =>
      item.name === 'potion' || item.name === 'super-potion' || item.name === 'hyper-potion'
    );
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  resetGameAction(): void {
    this.evolutionCredits = 0;
    this.catchStreak = 0;
    this.gameStateService.clearSave();
    this.trainerService.clearSave();
    this.resetGameEvent.emit();
    this.modalService.dismissAll();
  }

  private evolvePokemon(pokemon: PokemonItem): void {
    const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

    if (pokemonEvolutions.length === 1) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
      this.showpkmnEvoModal();
    } else {
      this.auxPokemonList = pokemonEvolutions;
      this.currentContextPokemon = pokemon;
      this.customWheelTitle = 'game.main.roulette.evolve.which';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
      this.finishCurrentState();
    }
  }

  private preparePokemonCapture(pokemon: PokemonItem): void {
    if (this.pokemonFormsService.hasForms(pokemon)) {
      const pokemonForms = this.pokemonFormsService.getPokemonForms(pokemon);

      if (pokemonForms.length > 1) {
        this.currentContextPokemon = structuredClone(pokemon);
        this.pokemonForms = pokemonForms;
        this.gameStateService.setNextState('select-form');
        this.finishCurrentState();
        return;
      }

    }
    this.completePokemonCapture(pokemon);
    return;
  }

  private completePokemonCapture(pokemon: PokemonItem): void {
    this.trainerService.addToTeam(pokemon);
    // Defer state transition to next tick so Angular can properly destroy the
    // current wheel canvas before the shiny-roulette wheel initializes its own.
    setTimeout(() => {
      this.gameStateService.setNextState('check-shininess');
      this.finishCurrentState();
      this.cdr.markForCheck();
    });
  }

  private replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    this.pkmnOut = pokemonOut;
    this.pkmnIn = structuredClone(pokemonIn);
    this.pkmnEvoTitle = "game.main.roulette.evolve.modal.title"
    this.trainerService.replaceForEvolution(this.pkmnOut, this.pkmnIn);

    if (this.trainerService.hasItem('exp-share') && this.expShareUsed === false) {
      this.expShareUsed = true;
      this.expSharePokemon = this.pkmnIn;
      this.secondEvolution();
    } else if (this.trainerService.hasItem('exp-share') && this.expShareUsed === true) {
      this.expShareUsed = false;
      this.expSharePokemon = null;
    }
  }

  private evolveSecondPokemon(pokemon: PokemonItem): void {
    const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

    if (pokemonEvolutions.length === 1) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
    } else if (pokemon.pokemonId === this.NINCADA_ID) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
      this.trainerService.addToTeam(pokemonEvolutions[1]);
    } else {
      this.auxPokemonList = pokemonEvolutions;
      this.currentContextPokemon = pokemon;
      this.customWheelTitle = 'game.main.roulette.evolve.which';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
    }
  }

  private removeFromTeam(pokemon: PokemonItem): void {
    this.trainerService.removeFromTeam(pokemon);
    this.auxPokemonList = [];
  }

  private playItemFoundAudio(): void {
    void this.soundFxService.playSoundFx(this.itemFoundAudio, 0.25);
  }

  private showpkmnEvoModal(): void {
    this.playItemFoundAudio();
    if (!this.settingsService.currentSettings.lessExplanations) {
      this.modalQueueService.open(this.pkmnEvoModal, {
        centered: true,
        size: 'md'
      }).then(modalRef => {
        modalRef.result.then(() => {
          this.finishCurrentState();
        }, () => {
          this.finishCurrentState();
        });
      });
    } else {
      this.finishCurrentState();
    }
  }

  private useEscapeRope(): void {
    const item = this.trainerService.getItem('escape-rope');
    if (item) {
      this.trainerService.removeItem(item);
      this.currentContextItem = item;
      this.gameStateService.setNextState('adventure-continues');

      if (!this.settingsService.currentSettings.lessExplanations) {
        this.modalQueueService.open(this.itemActivateModal, {
          centered: true,
          size: 'md'
        }).then(modalRef => {
          modalRef.result.then(() => {
            this.finishCurrentState();
          }, () => {
            this.finishCurrentState();
          });
        });
      } else {
        this.finishCurrentState();
      }
    }
  }
}
