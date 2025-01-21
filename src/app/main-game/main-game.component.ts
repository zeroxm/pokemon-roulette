import { Component } from '@angular/core';
import { BadgesComponent } from "../badges/badges.component";
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { PokemonSpriteService } from '../services/pokemon-sprite-service/pokemon-sprite.service';
import { GameState } from '../services/game-state-service/game-state';
import { Observable } from 'rxjs';
import { GenerationRouletteComponent } from './roulettes/generation-roulette/generation-roulette.component';
import { StarterRouletteComponent } from './roulettes/starter-roulette/starter-roulette.component';
import { GenerationItem } from '../interfaces/generation-item';
import { PokemonItem } from '../interfaces/pokemon-item';
import { ShinyRouletteComponent } from "./roulettes/shiny-roulette/shiny-roulette.component";
import { StartAdventureRouletteComponent } from "./roulettes/start-adventure-roulette/start-adventure-roulette.component";

@Component({
  selector: 'app-main-game',
  imports: [CommonModule,
    GenerationRouletteComponent,
    BadgesComponent,
    TrainerTeamComponent,
    ItemsComponent,
    StarterRouletteComponent,
    ShinyRouletteComponent, StartAdventureRouletteComponent],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent {

  constructor(private gameStateService: GameStateService,
              private pokemonSpriteService: PokemonSpriteService
  ) {

  }

  generation!: GenerationItem;
  starter!: PokemonItem;
  trainer = { sprite: 'place-holder-pixel.png' };

  trainerTeam: PokemonItem[] = [];

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
    if(this.trainerTeam.length === 0) {
      this.starter = pokemon;
    }
    this.addToTeam(pokemon);
    this.gameStateService.setNextState('check-shininess');
    this.gameStateService.finishCurrentState();
  }

  addToTeam(pokemon: PokemonItem): void {
    if(! pokemon.sprite) {
      this.pokemonSpriteService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        pokemon.sprite = response.sprite;
      });
    }
    this.trainerTeam.push(pokemon);
  }

  setShininess(shiny: boolean): void {
    this.trainerTeam[this.trainerTeam.length - 1].shiny = shiny;
    this.gameStateService.finishCurrentState();
  }

  doNothing(): void {
    this.gameStateService.finishCurrentState();
  }

  buyPotions(): void {
    this.gameStateService.finishCurrentState();
  }

  catchPokemon(): void {
    this.gameStateService.finishCurrentState();
  }

  evolvePokemon(): void {
    this.gameStateService.finishCurrentState();
  }
}
