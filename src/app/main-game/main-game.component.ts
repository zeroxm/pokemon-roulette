import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { GameState } from '../services/game-state-service/game-state';
import { GenerationRouletteComponent } from './roulettes/generation-roulette/generation-roulette.component';
import { StarterRouletteComponent } from './roulettes/starter-roulette/starter-roulette.component';
import { ShinyRouletteComponent } from "./roulettes/shiny-roulette/shiny-roulette.component";
import { StartAdventureRouletteComponent } from "./roulettes/start-adventure-roulette/start-adventure-roulette.component";
import { PokemonFromGenerationRouletteComponent } from "./roulettes/pokemon-from-generation-roulette/pokemon-from-generation-roulette.component";
import { EvolutionService } from '../services/evolution-service/evolution.service';
import { PokemonFromAuxListRouletteComponent } from "./roulettes/pokemon-from-aux-list-roulette/pokemon-from-aux-list-roulette.component";
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { GymBattleRouletteComponent } from "./roulettes/gym-battle-roulette/gym-battle-roulette.component";
import { ItemItem } from '../interfaces/item-item';
import { PokemonItem } from '../interfaces/pokemon-item';
import { ItemsService } from '../services/items-service/items.service';
import { RestartGameComponent } from "../restart-game/restart-game.component";
import { CheckEvolutionRouletteComponent } from "./roulettes/check-evolution-roulette/check-evolution-roulette.component";
import { MainAdventureRouletteComponent } from "./roulettes/main-adventure-roulette/main-adventure-roulette.component";
import { TeamRocketRouletteComponent } from "./roulettes/team-rocket-roulette/team-rocket-roulette.component";
import { MysteriousEggRouletteComponent } from "./roulettes/mysterious-egg-roulette/mysterious-egg-roulette.component";
import { LegendaryRouletteComponent } from "./roulettes/legendary-roulette/legendary-roulette.component";
import { CatchLegendaryRouletteComponent } from "./roulettes/catch-legendary-roulette/catch-legendary-roulette.component";
import { TradePokemonRouletteComponent } from "./roulettes/trade-pokemon-roulette/trade-pokemon-roulette.component";
import { FindItemRouletteComponent } from "./roulettes/find-item-roulette/find-item-roulette.component";
import { ExploreCaveRouletteComponent } from "./roulettes/explore-cave-roulette/explore-cave-roulette.component";
import { CavePokemonRouletteComponent } from "./roulettes/cave-pokemon-roulette/cave-pokemon-roulette.component";
import { PokemonService } from '../services/pokemon-service/pokemon.service';
import { TrainerService } from '../services/trainer-service/trainer.service';
import { FossilRouletteComponent } from "./roulettes/fossil-roulette/fossil-roulette.component";
import { SnorlaxRouletteComponent } from "./roulettes/snorlax-roulette/snorlax-roulette.component";
import { FishingRouletteComponent } from "./roulettes/fishing-roulette/fishing-roulette.component";
import { RivalBattleRouletteComponent } from './roulettes/rival-battle-roulette/rival-battle-roulette.component';
import { EliteFourPrepRouletteComponent } from "./roulettes/elite-four-prep-roulette/elite-four-prep-roulette.component";
import { EliteFourBattleRouletteComponent } from "./roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component";
import { ItemName } from '../services/items-service/item-names';
import { ChampionBattleRouletteComponent } from "./roulettes/champion-battle-roulette/champion-battle-roulette.component";
import { EndGameComponent } from "./end-game/end-game.component";
import { GameOverComponent } from "./game-over/game-over.component";
import { AnalyticsService } from '../services/analytics-service/analytics.service';
import { CreditsButtonComponent } from "./credits-button/credits-button.component";
import { CoffeeButtonComponent } from "./coffee-button/coffee-button.component";
import { GenerationMapComponent } from "./generation-map/generation-map.component";
import { NgIconsModule } from '@ng-icons/core';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { CharacterSelectComponent } from "./roulettes/character-select/character-select.component";

@Component({
  selector: 'app-main-game',
  imports: [
    CommonModule,
    DarkModeToggleComponent,
    GenerationRouletteComponent,
    TrainerTeamComponent,
    ItemsComponent,
    StarterRouletteComponent,
    ShinyRouletteComponent,
    StartAdventureRouletteComponent,
    PokemonFromGenerationRouletteComponent,
    PokemonFromAuxListRouletteComponent,
    GymBattleRouletteComponent,
    RestartGameComponent,
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
    SnorlaxRouletteComponent,
    FishingRouletteComponent,
    RivalBattleRouletteComponent,
    EliteFourPrepRouletteComponent,
    EliteFourBattleRouletteComponent,
    ChampionBattleRouletteComponent,
    EndGameComponent,
    GameOverComponent,
    CreditsButtonComponent,
    CoffeeButtonComponent,
    GenerationMapComponent,
    NgIconsModule,
    NgbCollapseModule,
    CharacterSelectComponent
],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent implements OnInit {

  NINCADA_ID = 290;

  constructor(
    private darkModeService: DarkModeService,
    private evolutionService: EvolutionService,
    private gameStateService: GameStateService,
    private itemService: ItemsService,
    private pokemonService: PokemonService,
    private trainerService: TrainerService,
    private modalService: NgbModal,
    private analyticsService: AnalyticsService) {
      this.darkMode = this.darkModeService.darkMode$;
    }

  ngOnInit(): void {
    this.analyticsService.trackEvent('main-game-loaded', 'Main Game Loaded', 'user acess');

    this.gameStateService.currentState.subscribe(state => {
      this.currentGameState = state;
      if (this.currentGameState === 'adventure-continues') {
        if (this.multitaskCounter > 0) {
          this.respinReason = 'Multitask x' + this.multitaskCounter;
          this.multitaskCounter--;
        }
        if (this.runningShoesUsed) {
          this.respinReason = '(Running Shoes)';
        }
      }
    });

    this.gameStateService.currentRoundObserver.subscribe(round => {
      this.leadersDefeatedAmount = round;
    });
  }

  @ViewChild('itemActivateModal', { static: true }) itemActivateModal!: TemplateRef<any>;
  @ViewChild('infoModal', { static: true }) infoModal!: TemplateRef<any>;
  @ViewChild('pkmnEvoModal', { static: true }) pkmnEvoModal!: TemplateRef<any>;
  @ViewChild('pkmnTradeModal', { static: true }) pkmnTradeModal!: TemplateRef<any>;

  currentGameState!: GameState;
  darkMode!: Observable<boolean>;
  mapIsCollapsed: boolean = true;

  lessExplanations: boolean = false;
  runningShoesUsed: boolean = false;
  expShareUsed: boolean = false;
  auxPokemonList: PokemonItem[] = [];
  currentContextPokemon!: PokemonItem;
  expSharePokemon: PokemonItem | null = null;
  stolenPokemon!: PokemonItem | null;
  currentContextItem!: ItemItem;
  leadersDefeatedAmount: number = 0;
  fromLeader: number = 0;
  evolutionCredits: number = 0;
  multitaskCounter: number = 0;
  customWheelTitle = '';
  respinReason = '';
  infoModalTitle = '';
  infoModalMessage = '';
  pkmnEvoTitle = '';
  pkmnTradeTitle = '';
  pkmnOut!: PokemonItem;
  pkmnIn!: PokemonItem;
  itemFoundAudio = new Audio('./ItemFound.mp3');

  toggleLessExplanations(): void {
    this.lessExplanations = !this.lessExplanations;
  }

  resetGameAction(): void {
    this.resetGame();
    this.modalService.dismissAll();
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  getGameState(): string {
    return this.currentGameState;
  }


  handleGenerationSelected(): void {
    this.finishCurrentState();
  }

  handleTrainerSelected(): void {
    this.finishCurrentState();
  }

  storePokemon(pokemon: PokemonItem): void {
    this.trainerService.addToTeam(pokemon);
    this.gameStateService.setNextState('check-shininess');
    this.finishCurrentState();
  }

  setShininess(shiny: boolean): void {
    if (shiny) {
      this.trainerService.makeShiny();
    }
    this.finishCurrentState();
  }

  doNothing(): void {
    this.finishCurrentState();
  }

  getLost(): void {
    if (this.trainerService.hasItem('escape-rope')) {
      this.useEscapeRope();
    } else {
      return this.doNothing();
    }
  }

  buyPotions(): void {

    let itemName: ItemName = 'potion';

    if (this.leadersDefeatedAmount > 6) {
      itemName = 'hyper-potion';
    } else if (this.leadersDefeatedAmount > 3) {
      itemName = 'super-potion';
    }

    this.trainerService.addToItems(this.itemService.getItem(itemName));
    this.itemFoundAudio.volume = 0.25;
    this.itemFoundAudio.play();
    this.finishCurrentState();
  }

  catchPokemon(): void {
    this.gameStateService.setNextState('catch-pokemon');
    this.finishCurrentState();
  }

  catchTwoPokemon(): void {
    this.gameStateService.setNextState('catch-pokemon');
    this.gameStateService.setNextState('catch-pokemon');
    this.finishCurrentState();
  }

  catchCavePokemon(): void {
    this.gameStateService.setNextState('catch-cave-pokemon');
    this.finishCurrentState();
  }

  catchZubat(): void {
    const zubat = this.pokemonService.getPokemonById(41);
    if (zubat) {
      this.trainerService.addToTeam(zubat);
      this.gameStateService.setNextState('check-shininess');
    }
    this.finishCurrentState();
  }

  catchSnorlax(): void {
    const snorlax = this.pokemonService.getPokemonById(143);
    if (snorlax) {
      this.trainerService.addToTeam(snorlax);
      this.gameStateService.setNextState('check-shininess');
    }
    this.finishCurrentState();
  }

  legendaryCaptureChance(pokemon: PokemonItem): void {
    this.currentContextPokemon = pokemon;
    this.gameStateService.setNextState('catch-legendary');
    this.finishCurrentState();
  }

  legendaryCaptureSuccess(): void {
    this.gameStateService.setNextState('check-shininess');
    this.trainerService.addToTeam(this.currentContextPokemon);
    this.finishCurrentState();
  }

  receiveItem(item: ItemItem): void {
    this.trainerService.addToItems(item);
    this.finishCurrentState();
  }

  rareCandyInterrupt(rareCandy: ItemItem): void {
    this.auxPokemonList = this.trainerService.getPokemonThatCanEvolve();

    if (this.auxPokemonList.length !== 0) {
      this.gameStateService.repeatCurrentState();
      this.trainerService.removeItem(rareCandy);
      this.currentContextItem = rareCandy;
      this.chooseWhoWillEvolve();
    }
  }

  chooseWhoWillEvolve(): void {
    this.auxPokemonList = [];

    this.auxPokemonList = this.trainerService.getPokemonThatCanEvolve();

    if (this.auxPokemonList.length === 0) {
      return this.doNothing();
    }

    if (this.auxPokemonList.length === 1) {
      return this.evolvePokemon(this.auxPokemonList[0]);
    }

    this.customWheelTitle = 'Who will evolve?';
    this.gameStateService.setNextState('evolve-pokemon');
    this.gameStateService.setNextState('select-from-pokemon-list');

    this.finishCurrentState();
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

    this.customWheelTitle = 'Who will evolve (Exp. Share)?';
    this.gameStateService.setNextState('evolve-pokemon');
    this.gameStateService.setNextState('select-from-pokemon-list');
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

  gymBattleResult(result: boolean): void {
    this.runningShoesUsed = false;
    this.respinReason = '';

    if (result) {
      this.itemFoundAudio.volume = 0.25;
      this.itemFoundAudio.play();
      this.trainerService.addBadge(this.leadersDefeatedAmount, this.fromLeader);
      this.gameStateService.setNextState('check-evolution');

    } else {
      this.gameStateService.setNextState('game-over');
    }

    this.finishCurrentState();
  }

  eliteFourBattleResult(result: boolean): void {
    this.runningShoesUsed = false;
    this.respinReason = '';

    if (result) {
      this.gameStateService.setNextState('check-evolution');
    } else {
      this.gameStateService.setNextState('game-over');
    }
    this.finishCurrentState();
  }

  championBattleResult(result: boolean): void {

    this.runningShoesUsed = false;
    this.respinReason = '';

    if (!result) {
      this.gameStateService.setNextState('game-over');
    }

    this.finishCurrentState();
  }

  teamRocketEncounter(): void {
    this.gameStateService.setNextState('team-rocket-encounter');
    this.finishCurrentState();
  }

  mysteriousEgg(): void {
    this.gameStateService.setNextState('mysterious-egg');
    this.finishCurrentState();
  }

  legendaryEncounter(): void {
    this.gameStateService.setNextState('legendary-encounter');
    this.finishCurrentState();
  }

  tradePokemon(): void {
    this.gameStateService.setNextState('trade-pokemon');

    const trainerTeam = this.trainerService.getTeam();

    if (trainerTeam.length === 1) {
      this.currentContextPokemon = trainerTeam[0];
    } else {
      this.auxPokemonList = trainerTeam;
      this.customWheelTitle = 'Which Pokémon?';
      this.gameStateService.setNextState('select-from-pokemon-list');
    }

    this.finishCurrentState();
  }

  findItem(): void {
    this.gameStateService.setNextState('find-item');
    this.finishCurrentState();
  }

  exploreCave(): void {
    this.gameStateService.setNextState('explore-cave');
    this.finishCurrentState();
  }

  snorlaxEncounter(): void {
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
    this.gameStateService.setNextState('go-fishing');
    this.finishCurrentState();
  }

  findFossil(): void {
    this.gameStateService.setNextState('find-fossil');
    this.finishCurrentState();
  }

  battleRival(): void {
    this.gameStateService.setNextState('battle-rival');
    this.finishCurrentState();
  }

  rivalBattleResult(result: boolean): void {
    if (result) {
      this.chooseWhoWillEvolve();
    } else {
      this.doNothing();
    }
  }

  stealPokemon(): void {

    const trainerTeam = this.trainerService.getTeam();

    if (trainerTeam.length === 1) {
      this.infoModalTitle = 'Team Rocket Fails';
      this.infoModalMessage = 'Team Rocket fails to steal your last Pokémon.';
      const modalRef = this.modalService.open(this.infoModal, {
        centered: true,
        size: 'md'
      });

      modalRef.result.then(() => {
        return this.doNothing();
      }, () => {
        return this.doNothing();
      });
    } else if (this.trainerService.hasItem('escape-rope')) {
      this.useEscapeRope();
    } else {
      this.auxPokemonList = trainerTeam;
      this.customWheelTitle = 'Which Pokémon?';
      this.gameStateService.setNextState('steal-pokemon');
      this.gameStateService.setNextState('select-from-pokemon-list');
      this.finishCurrentState();
    }
  }

  teamRocketDefeated(): void {

    if (this.stolenPokemon) {
      this.trainerService.addToTeam(this.stolenPokemon);
      this.infoModalTitle = 'Saved ' + this.stolenPokemon.text + '!';
      this.infoModalMessage = 'You recovered your ' + this.stolenPokemon.text + ' from Team Rocket.';
      this.stolenPokemon = null;
      this.modalService.open(this.infoModal, {
        centered: true,
        size: 'md'
      });
    }

    this.chooseWhoWillEvolve();
  }

  performTrade(pokemon: PokemonItem): void {
    this.pkmnIn = pokemon;
    this.pkmnOut = this.currentContextPokemon;
    this.pkmnTradeTitle = "Trade!";
    this.trainerService.performTrade(this.currentContextPokemon, pokemon);
    this.auxPokemonList = [];
    this.itemFoundAudio.volume = 0.25;
    this.itemFoundAudio.play();
    if (!this.lessExplanations) {
      const modalRef = this.modalService.open(this.pkmnTradeModal, {
        centered: true,
        size: 'md'
      });

      modalRef.result.then(() => {
        this.finishCurrentState();
      }, () => {
        this.finishCurrentState();
      });
    } else {
      this.finishCurrentState();
    }
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

  private resetGame(): void {
    this.trainerService.resetTrainer();
    this.trainerService.resetTeam();
    this.trainerService.resetItems();
    this.trainerService.resetBadges();
    this.evolutionCredits = 0;
    this.gameStateService.resetGameState();
  }

  private evolvePokemon(pokemon: PokemonItem): void {
    const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

    if (pokemonEvolutions.length === 1) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
      this.showpkmnEvoModal();
    } else {
      this.auxPokemonList = pokemonEvolutions;
      this.currentContextPokemon = pokemon;
      this.customWheelTitle = 'Which evolution?';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
      this.finishCurrentState();
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
      this.customWheelTitle = 'Which evolution?';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
    }
  }

  private replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {

    this.pkmnOut = pokemonOut;
    this.pkmnIn = pokemonIn;
    this.pkmnEvoTitle = "Evolution!"
    this.trainerService.replaceForEvolution(pokemonOut, pokemonIn);

    if (this.trainerService.hasItem('exp-share') && this.expShareUsed === false) {
      this.expShareUsed = true;
      this.expSharePokemon = pokemonIn;
      this.secondEvolution();
    } else if (this.trainerService.hasItem('exp-share') && this.expShareUsed === true) {
      this.expShareUsed = false;
      this.expSharePokemon = null;
    }
  }

  private removeFromTeam(pokemon: PokemonItem): void {
    this.trainerService.removeFromTeam(pokemon);
    this.auxPokemonList = [];
  }

  private useEscapeRope(): void {
    const item = this.trainerService.getItem('escape-rope');
    if (item) {
      this.trainerService.removeItem(item);
      this.currentContextItem = item;
      this.gameStateService.setNextState('adventure-continues');

      if (!this.lessExplanations) {
        const modalRef = this.modalService.open(this.itemActivateModal, {
          centered: true,
          size: 'md'
        });

        modalRef.result.then(() => {
          this.finishCurrentState();
        }, () => {
          this.finishCurrentState();
        });
      } else {
        this.finishCurrentState();
      }
    }
  }

  private showpkmnEvoModal(): void {
    this.itemFoundAudio.volume = 0.25;
    this.itemFoundAudio.play();
    if (!this.lessExplanations) {
      const modalRef = this.modalService.open(this.pkmnEvoModal, {
        centered: true,
        size: 'md'
      });

      modalRef.result.then(() => {
        this.finishCurrentState();
      }, () => {
        this.finishCurrentState();
      });
    } else {
      this.finishCurrentState();
    }
  }
}
