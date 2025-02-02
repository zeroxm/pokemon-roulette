import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { PokemonSpriteService } from '../services/pokemon-sprite-service/pokemon-sprite.service';
import { GameState } from '../services/game-state-service/game-state';
import { GenerationRouletteComponent } from './roulettes/generation-roulette/generation-roulette.component';
import { StarterRouletteComponent } from './roulettes/starter-roulette/starter-roulette.component';
import { ShinyRouletteComponent } from "./roulettes/shiny-roulette/shiny-roulette.component";
import { StartAdventureRouletteComponent } from "./roulettes/start-adventure-roulette/start-adventure-roulette.component";
import { ItemSpriteService } from '../services/item-sprite-service/item-sprite.service';
import { PokemonFromGenerationRouletteComponent } from "./roulettes/pokemon-from-generation-roulette/pokemon-from-generation-roulette.component";
import { EvolutionService } from '../services/evolution-service/evolution.service';
import { PokemonFromAuxListRouletteComponent } from "./roulettes/pokemon-from-aux-list-roulette/pokemon-from-aux-list-roulette.component";
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { GymBattleRouletteComponent } from "./roulettes/gym-battle-roulette/gym-battle-roulette.component";
import { Badge } from '../interfaces/badge';
import { GenerationItem } from '../interfaces/generation-item';
import { ItemItem } from '../interfaces/item-item';
import { PokemonItem } from '../interfaces/pokemon-item';
import { ItemsService } from '../services/items-service/items.service';
import { NgIconsModule } from '@ng-icons/core';
import { RestartGameComponent } from "../restart-game/restart-game.component";
import { BadgesService } from '../services/badges-service/badges.service';
import { CheckEvolutionRouletteComponent } from "./roulettes/check-evolution-roulette/check-evolution-roulette.component";
import { MainAdventureRouletteComponent } from "./roulettes/main-adventure-roulette/main-adventure-roulette.component";
import { TeamRocketRouletteComponent } from "./roulettes/team-rocket-roulette/team-rocket-roulette.component";
import { MysteriousEggRouletteComponent } from "./roulettes/mysterious-egg-roulette/mysterious-egg-roulette.component";
import { LegendaryRouletteComponent } from "./roulettes/legendary-roulette/legendary-roulette.component";
import { CatchLegendaryRouletteComponent } from "./roulettes/catch-legendary-roulette/catch-legendary-roulette.component";
import { TradePokemonRouletteComponent } from "./roulettes/trade-pokemon-roulette/trade-pokemon-roulette.component";
import { FindItemRouletteComponent } from "./roulettes/find-item-roulette/find-item-roulette.component";
import { ItemName } from '../services/items-service/item-names';
import { ExploreCaveRouletteComponent } from "./roulettes/explore-cave-roulette/explore-cave-roulette.component";
import { PokemonService } from '../services/pokemon-service/pokemon.service';
import { CavePokemonRouletteComponent } from "./roulettes/cave-pokemon-roulette/cave-pokemon-roulette.component";

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
    NgIconsModule,
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
    CavePokemonRouletteComponent
],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent {

  constructor(private badgesService: BadgesService,
    private evolutionService: EvolutionService,
    private gameStateService: GameStateService,
    private itemService: ItemsService,
    private itemSpriteService: ItemSpriteService,
    private pokemonService: PokemonService,
    private pokemonSpriteService: PokemonSpriteService,
    private modalService: NgbModal) {
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
    })
  }

  @ViewChild('gameOverModal', { static: true }) gameOverModalTemplate!: TemplateRef<any>;
  @ViewChild('itemActivateModal', { static: true }) itemActivateModal!: TemplateRef<any>;
  @ViewChild('infoModal', { static: true }) infoModal!: TemplateRef<any>;

  currentGameState!: GameState;

  generation: GenerationItem = { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1, weight: 1 };
  // generation!: GenerationItem;
  starter!: PokemonItem;

  trainer = { sprite: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' };
  // trainer = { sprite: './place-holder-pixel.png' };
  trainerTeam: PokemonItem[] = [
    { text: "Bulbasaur", pokemonId: 1, fillStyle: "green", 
      sprite: {
        front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png"
      },
      shiny: false, power: 1, weight: 1 
    },
    { text: "Bulbasaur", pokemonId: 1, fillStyle: "green", 
      sprite: {
        front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png"
      },
      shiny: false, power: 1, weight: 1 
    }
  ];
  trainerItems: ItemItem[] = [
    // {
    //   text: 'Escape Rope',
    //   name: 'escape-rope',
    //   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/escape-rope.png',
    //   fillStyle: 'maroon',
    //   weight: 1,
    //   description: 'Escape Rope saves you from bad situations!'
    // }
  ];
  trainerBadges: Badge[] = [
    {
      name: 'Boulder Badge',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/badges/1.png'
    },
  ];
  // leadersDefeatedAmount: number = 0;
  runningShoesUsed: boolean = false;
  expShareUsed: boolean = false;
  auxPokemonList: PokemonItem[] = [];
  currentContextPokemon!: PokemonItem;
  expSharePokemon: PokemonItem | null = null;
  stolenPokemon!: PokemonItem | null;
  currentContextItem!: ItemItem;
  leadersDefeatedAmount: number = 1;
  evolutionCredits: number = 0;
  multitaskCounter: number = 0;
  customWheelTitle = '';
  respinReason = '';
  infoModalTitle = '';
  infoModalMessage = '';

  closeGameOverModal(): void {
    this.resetGame();
    this.modalService.dismissAll();
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  getGameState(): string {
    return this.currentGameState;
  }

  storeGeneration(generation: GenerationItem): void {
    this.generation = generation;
  }

  storeTrainerSprite(sprite: string): void {
    this.trainer.sprite = sprite;
    this.finishCurrentState();
  }

  storePokemon(pokemon: PokemonItem): void {
    if (this.trainerTeam.length === 0) {
      this.starter = pokemon;
    }
    this.addToTeam(pokemon);
    this.gameStateService.setNextState('check-shininess');
    this.finishCurrentState();
  }

  setShininess(shiny: boolean): void {
    this.trainerTeam[this.trainerTeam.length - 1].shiny = shiny;
    this.finishCurrentState();
  }

  doNothing(): void {
    this.finishCurrentState();
  }

  getLost(): void {
    if (this.hasItem('escape-rope')) {
      const item = this.getItem('escape-rope')
      if (item) {
        this.removeItem(item);
        this.gameStateService.setNextState('adventure-continues');

        const modalRef = this.modalService.open(this.itemActivateModal, {
          centered: true,
          size: 'md'
        });

        modalRef.result.then(() => {
          return this.doNothing();
        }, () => {
          return this.doNothing();
        });
      }
    } else {
      return this.doNothing();
    }
  }

  buyPotions(): void {
    this.itemService.getItem('potion').subscribe(potion => {
      this.addToItems(potion);
    })
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
      this.addToTeam(zubat);  
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
    this.addToTeam(this.currentContextPokemon);
    this.finishCurrentState();
  }

  receiveItem(item: ItemItem): void {
    this.addToItems(item);
    this.finishCurrentState();
  }

  rareCandyInterrupt(rareCandy: ItemItem): void {
    this.trainerTeam.forEach(pokemon => {
      if (this.evolutionService.canEvolve(pokemon)) {
        this.auxPokemonList.push(pokemon);
      }
    });

    if (this.auxPokemonList.length !== 0) {
      this.gameStateService.repeatCurrentState();
      this.removeItem(rareCandy);
      this.chooseWhoWillEvolve();
    }
  }

  chooseWhoWillEvolve(): void {
    this.auxPokemonList = [];

    this.trainerTeam.forEach(pokemon => {
      if (this.evolutionService.canEvolve(pokemon)) {
        this.auxPokemonList.push(pokemon);
      }
    });

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

    this.trainerTeam.forEach(pokemon => {
      if (this.evolutionService.canEvolve(pokemon)) {
        this.auxPokemonList.push(pokemon);
      }
    });

    if (this.expSharePokemon) {
      const index = this.auxPokemonList.indexOf(this.expSharePokemon);
      if (index > -1) {
        this.auxPokemonList.splice(index, 1);
      }
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
        this.finishCurrentState();
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
      this.badgesService.getBadge(this.generation, this.leadersDefeatedAmount).subscribe(badge => {
        this.trainerBadges.push(badge);
      })
      this.leadersDefeatedAmount++;
      this.gameStateService.setNextState('check-evolution');

    } else {
      this.gameStateService.setNextState('game-over');
      this.modalService.open(this.gameOverModalTemplate, {
        centered: true,
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
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

    if (this.trainerTeam.length === 1) {
      this.currentContextPokemon = this.trainerTeam[0];
    } else {
      this.auxPokemonList = this.trainerTeam;
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

  stealPokemon(): void {
    if (this.trainerTeam.length === 1) {
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
    } else if (this.hasItem('escape-rope')) {
      const item = this.getItem('escape-rope')
      if (item) {
        this.removeItem(item);
        this.gameStateService.setNextState('adventure-continues');

        const modalRef = this.modalService.open(this.itemActivateModal, {
          centered: true,
          size: 'md'
        });

        modalRef.result.then(() => {
          return this.doNothing();
        }, () => {
          return this.doNothing();
        });
      }
    } else {
      this.auxPokemonList = this.trainerTeam;
      this.customWheelTitle = 'Which Pokémon?';
      this.gameStateService.setNextState('steal-pokemon');
      this.gameStateService.setNextState('select-from-pokemon-list');
      this.finishCurrentState();
    }
  }

  teamRocketDefeated(): void {

    if (this.stolenPokemon) {
      this.trainerTeam.push(this.stolenPokemon);
      this.infoModalTitle = 'Saved '+ this.stolenPokemon.text + '!';
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
    if (!pokemon.sprite) {
      this.pokemonSpriteService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        pokemon.sprite = response.sprite;
      });
    }

    const index = this.trainerTeam.indexOf(this.currentContextPokemon);
    if (index > -1) {
      this.trainerTeam.splice(index, 1, pokemon);
    }
    this.auxPokemonList = [];
    this.finishCurrentState();
  }

  private finishCurrentState(): void {

    this.gameStateService.finishCurrentState();

    if (this.currentGameState === 'adventure-continues') {
      if (this.hasItem('running-shoes') && !this.runningShoesUsed) {
        this.runningShoesUsed = true;
        this.gameStateService.setNextState('adventure-continues');
      }
    }
  }

  private hasItem(itemName: ItemName): boolean {
    return this.trainerItems.some(item => item.name === itemName);
  }

  private getItem(itemName: ItemName): ItemItem | undefined {
    return this.trainerItems.find(item => item.name === itemName);
  }

  private resetGame(): void {
    this.trainer = { sprite: './place-holder-pixel.png' };
    this.trainerTeam = [];
    this.trainerItems = [];
    this.trainerBadges = [];
    this.leadersDefeatedAmount = 0;
    this.evolutionCredits = 0;
    this.gameStateService.resetGameState();
  }

  private addToTeam(pokemon: PokemonItem): void {
    if (!pokemon.sprite) {
      this.pokemonSpriteService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        pokemon.sprite = response.sprite;
      });
    }
    this.trainerTeam.push(pokemon);
  }

  private addToItems(item: ItemItem): void {
    if (!item.sprite) {
      this.itemSpriteService.getItemSprite(item.name).subscribe(response => {
        item.sprite = response.sprite;
      });
    }
    this.trainerItems.push(item);
  }

  private evolvePokemon(pokemon: PokemonItem): void {
    const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

    if (pokemonEvolutions.length === 1) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
    } else {
      this.auxPokemonList = pokemonEvolutions;
      this.currentContextPokemon = pokemon;
      this.customWheelTitle = 'Which evolution?';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
    }
    this.finishCurrentState();
  }

  private evolveSecondPokemon(pokemon: PokemonItem): void {
    const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

    if (pokemonEvolutions.length === 1) {
      this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
    } else {
      this.auxPokemonList = pokemonEvolutions;
      this.currentContextPokemon = pokemon;
      this.customWheelTitle = 'Which evolution?';
      this.gameStateService.setNextState('select-evolution');
      this.gameStateService.setNextState('select-from-pokemon-list');
    }
  }

  private replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    pokemonIn.shiny = pokemonOut.shiny;
    const index = this.trainerTeam.indexOf(pokemonOut);

    if (!pokemonIn.sprite) {
      this.pokemonSpriteService.getPokemonSprites(pokemonIn.pokemonId).subscribe(response => {
        pokemonIn.sprite = response.sprite;
      });
    }
    this.trainerTeam.splice(index, 1, pokemonIn);
    this.auxPokemonList = [];

    if (this.hasItem('exp-share') && this.expShareUsed === false) {
      this.expShareUsed = true;
      this.expSharePokemon = pokemonIn;
      this.secondEvolution();
    } else if (this.hasItem('exp-share') && this.expShareUsed === true) {
      this.expShareUsed = false;
      this.expSharePokemon = null;
    }
  }

  private removeFromTeam(pokemon: PokemonItem): void {
    const index = this.trainerTeam.indexOf(pokemon);
    if (index !== -1) {
      this.trainerTeam.splice(index, 1);
    }
    this.auxPokemonList = [];
  }

  private removeItem(item: ItemItem): void {
    const index = this.trainerItems.indexOf(item);
    this.currentContextItem = item;
    if (index !== -1) {
      this.trainerItems.splice(index, 1);
    }
  }
}
