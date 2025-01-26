import { Component } from '@angular/core';
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { PokemonSpriteService } from '../services/pokemon-sprite-service/pokemon-sprite.service';
import { GameState } from '../services/game-state-service/game-state';
import { Observable, take } from 'rxjs';
import { GenerationRouletteComponent } from './roulettes/generation-roulette/generation-roulette.component';
import { StarterRouletteComponent } from './roulettes/starter-roulette/starter-roulette.component';
import { GenerationItem } from '../interfaces/generation-item';
import { PokemonItem } from '../interfaces/pokemon-item';
import { ShinyRouletteComponent } from "./roulettes/shiny-roulette/shiny-roulette.component";
import { StartAdventureRouletteComponent } from "./roulettes/start-adventure-roulette/start-adventure-roulette.component";
import { ItemItem } from '../interfaces/item-item';
import { ItemSpriteService } from '../services/item-sprite-service/item-sprite.service';
import { PokemonFromGenerationRouletteComponent } from "./roulettes/pokemon-from-generation-roulette/pokemon-from-generation-roulette.component";
import { EvolutionService } from '../services/evolution-service/evolution.service';
import { PokemonFromAuxListRouletteComponent } from "./roulettes/pokemon-from-aux-list-roulette/pokemon-from-aux-list-roulette.component";
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { GymBattleRouletteComponent } from "./roulettes/gym-battle-roulette/gym-battle-roulette.component";
import { Badge } from '../interfaces/badge';

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
    GymBattleRouletteComponent
  ],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent {

  constructor(private evolutionService: EvolutionService,
    private gameStateService: GameStateService,
    private itemSpriteService: ItemSpriteService,
    private pokemonSpriteService: PokemonSpriteService) {
  }

  customWheelTitle = '';

  generation: GenerationItem = {
    text: "Gen 1",
    region: "Kanto",
    fillStyle: "crimson",
    id: 1 
  };

  starter!: PokemonItem;
  
  trainer = { sprite: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' };
  trainerTeam: PokemonItem[] = [
    { text: "Pikachu",
      pokemonId: 25,
      fillStyle: "goldenrod",
      sprite:
      {
        front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", 
        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png"
      }, 
      shiny: false, 
      power: 1
    }
  ];
  trainerItems: ItemItem[] = [
    { text: "Potion",
      name: "potion",
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png",
      fillStyle: "darkpurple" 
    }
  ];
  trainerBadges: Badge[] = [];
  leadersDefeatedAmount: number = 0;
  auxPokemonList: PokemonItem[] = [];
  currentContextPokemon!: PokemonItem;

  getGameState(): Observable<GameState> {
    return this.gameStateService.currentState;
  }

  storeGeneration(generation: GenerationItem): void {
    this.generation = generation;
  }

  storeTrainerSprite(sprite: string): void {
    this.trainer.sprite = sprite;
    this.gameStateService.finishCurrentState();
  }

  storePokemon(pokemon: PokemonItem): void {
    if (this.trainerTeam.length === 0) {
      this.starter = pokemon;
    }
    this.addToTeam(pokemon);
    this.gameStateService.setNextState('check-shininess');
    this.gameStateService.finishCurrentState();
  }

  setShininess(shiny: boolean): void {
    this.trainerTeam[this.trainerTeam.length - 1].shiny = shiny;
    this.gameStateService.finishCurrentState();
  }

  doNothing(): void {
    this.gameStateService.finishCurrentState();
  }

  buyPotions(): void {
    let potion: ItemItem = {
      text: 'Potion',
      name: 'potion',
      sprite: '',
      fillStyle: 'darkpurple'
    }
    this.addToItems(potion);
    this.gameStateService.finishCurrentState();
  }


  catchPokemon(): void {
    this.gameStateService.setNextState('catch-pokemon');
    this.gameStateService.finishCurrentState();
  }

  battleTrainer(): void {
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
    this.gameStateService.finishCurrentState();
  }

  continueWithPokemon(pokemon: PokemonItem): void {
    this.gameStateService.finishCurrentState();
    this.getGameState().pipe(take(1)).subscribe(state => {
      switch (state) {
        case 'evolve-pokemon':
          this.evolvePokemon(pokemon);
          break;
        case 'select-evolution':
          this.replaceForEvolution(this.currentContextPokemon,pokemon);
          this.gameStateService.finishCurrentState();
          break;
        default:
          break;
      }
    });
  }

  gymBattleResult(result: boolean): void {
    if (result) {
      this.leadersDefeatedAmount++;
      this.gameStateService.finishCurrentState();
    } else {
      // check if there's a potion to use
      // if not, game over
      // if there is, remove from item list and show a message saying that you can roll again
      // 
      this.gameStateService.setNextState('game-over');
    }
    console.debug(result);
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
    this.gameStateService.finishCurrentState();
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
  }
}
