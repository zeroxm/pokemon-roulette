import { Component, OnInit } from '@angular/core';
import { GenerationItem, GenerationRouletteComponent } from "../generation-roulette/generation-roulette.component";
import { BadgesComponent } from "../badges/badges.component";
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { StarterRouletteComponent } from "../starter-roulette/starter-roulette.component";
import { Item } from '../wheel/wheel.component';
import { map } from 'rxjs';
import { PokemonSpriteService } from '../services/pokemon-sprite-service/pokemon-sprite.service';

export interface PokemonItem extends Item {
  pokemonId: number;
  sprite: {
    front_default: string;
    front_shiny: string;
  } | null;
}

@Component({
  selector: 'app-main-game',
  imports: [CommonModule,
            GenerationRouletteComponent,
            BadgesComponent,
            TrainerTeamComponent,
            ItemsComponent,
            StarterRouletteComponent],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent implements OnInit {

  constructor(private gameStateService: GameStateService,
              private pokemonSpriteService: PokemonSpriteService
  ) {

  }

  generation!: GenerationItem;
  starter!: PokemonItem;
  trainer = { sprite: 'place-holder-pixel.png' };

  trainerTeam: PokemonItem[] = [];

  ngOnInit(): void {
    this.gameStateService.setState('game-start');
  }

  getGameState(): string {
    return this.gameStateService.getState();
  }

  storeGeneration(generation: GenerationItem): void {
    this.generation = generation;
  }

  storeTrainerSprite(sprite: string): void {
    this.trainer.sprite = sprite;
    this.gameStateService.setState('starter-pokemon');
  }

  storeStarter(starter: PokemonItem): void {
    this.starter = starter;
    this.addToTeam(this.starter);
    // this.gameStateService.setState('start-adventure');
  }

  addToTeam(pokemon: PokemonItem): void {
    if(! pokemon.sprite) {
      this.pokemonSpriteService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        console.debug(response);
        pokemon.sprite = response.sprite;
      });
    }
    this.trainerTeam.push(pokemon);
  }
}
