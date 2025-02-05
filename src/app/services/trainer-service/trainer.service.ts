import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { trainerSpriteData } from './trainer-sprite-data';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonService } from '../pokemon-service/pokemon.service';
import { EvolutionService } from '../evolution-service/evolution.service';
import { ItemItem } from '../../interfaces/item-item';
import { ItemSpriteService } from '../item-sprite-service/item-sprite.service';
import { ItemName } from '../items-service/item-names';
import { Badge } from '../../interfaces/badge';
import { BadgesService } from '../badges-service/badges.service';
import { GenerationService } from '../generation-service/generation.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {

  constructor(private badgesService: BadgesService,
    private evolutionService: EvolutionService,
    private generationService: GenerationService,
    private itemSpriteService: ItemSpriteService,
    private pokemonService: PokemonService) {
  }

  trainerSpriteData = trainerSpriteData;

  private trainer = new BehaviorSubject<{ sprite: string }>({ sprite: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png' });
  // private trainer = new BehaviorSubject<{ sprite: string }>({ sprite: './place-holder-pixel.png' });
  gender: string = 'male';

  trainerTeam: PokemonItem[] = [
    { text: "Eevee", pokemonId: 133, fillStyle: "brown", 
      sprite: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/133.png"
      },
      shiny: false, power: 2, weight: 1 
    },
    { text: "Eevee", pokemonId: 133, fillStyle: "brown", 
      sprite: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/133.png"
      },
      shiny: false, power: 2, weight: 1 
    },
    // {
    //   text: "Pikachu", pokemonId: 25, fillStyle: "goldenrod",
    //   sprite: {
    //     front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    //     front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png"
    //   },
    //   shiny: true, power: 2, weight: 1
    // },
    // { text: "Snorlax", pokemonId: 143, fillStyle: "black",
    //   sprite: {
    // 		"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    // 		"front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/143.png"
    // 	},
    //   shiny: true, power: 3, weight: 1 },
  ];
  private trainerTeamObservable = new BehaviorSubject<PokemonItem[]>(this.trainerTeam);
  private lastPokemonAddedIndex: number = 0;

  trainerItems: ItemItem[] = [
    {
      text: 'Exp Share',
      name: 'exp-share',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png',
      fillStyle: 'black',
      weight: 1,
      description: 'Whenever a Pokémon evolves, Exp Share makes another Pokémon evolve!'
    },
    {
      text: 'Potion',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'Potion let you spin again whenever you would lose a Gym battle!'
    }, {
      text: 'Potion',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'Potion let you spin again whenever you would lose a Gym battle!'
    },
  ];
  private trainerItemsObservable = new BehaviorSubject<ItemItem[]>(this.trainerItems);

  trainerBadges: Badge[] = [
    { name: 'Boulder Badge', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/badges/1.png' }
  ];
  private trainerBadgesObservable = new BehaviorSubject<Badge[]>(this.trainerBadges);

  getTrainer(): Observable<{ sprite: string }> {
    return this.trainer.asObservable();
  }

  getTrainerSprite(generation: number, gender: string): string {
    return this.trainerSpriteData[generation][gender];
  }

  setTrainer(generation: number, gender: string) {
    this.gender = gender;
    this.trainer.next({ sprite: this.getTrainerSprite(generation, gender) });
  }

  addToTeam(pokemon: PokemonItem): void {
    if (!pokemon.sprite) {
      this.pokemonService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        pokemon.sprite = response.sprite;
      });
    }
    this.trainerTeam.push(pokemon);
    this.lastPokemonAddedIndex = this.trainerTeam.length - 1;
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  removeFromTeam(pokemon: PokemonItem): void {
    const index = this.trainerTeam.indexOf(pokemon);
    if (index !== -1) {
      this.trainerTeam.splice(index, 1);
    }
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  getTeam(): PokemonItem[] {
    return this.trainerTeam;
  }

  getTeamObservable(): Observable<PokemonItem[]> {
    return this.trainerTeamObservable.asObservable();
  }

  makeShiny(): void {
    this.trainerTeam[this.lastPokemonAddedIndex].shiny = true;
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  getPokemonThatCanEvolve(): PokemonItem[] {
    const auxPokemonList: PokemonItem[] = [];
    this.trainerTeam.forEach(pokemon => {
      if (this.evolutionService.canEvolve(pokemon)) {
        auxPokemonList.push(pokemon);
      }
    });
    return auxPokemonList;
  }

  replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    pokemonIn.shiny = pokemonOut.shiny;
    const index = this.trainerTeam.indexOf(pokemonOut);

    if (!pokemonIn.sprite) {
      this.pokemonService.getPokemonSprites(pokemonIn.pokemonId).subscribe(response => {
        pokemonIn.sprite = response.sprite;
      });
    }

    this.trainerTeam.splice(index, 1, pokemonIn);
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  performTrade(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    if (!pokemonIn.sprite) {
      this.pokemonService.getPokemonSprites(pokemonIn.pokemonId).subscribe(response => {
        pokemonIn.sprite = response.sprite;
      });
    }

    const index = this.trainerTeam.indexOf(pokemonOut);
    if (index > -1) {
      this.trainerTeam.splice(index, 1, pokemonIn);
    }
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  getItems(): ItemItem[] {
    return this.trainerItems;
  }

  getItemsObservable(): Observable<ItemItem[]> {
    return this.trainerItemsObservable.asObservable();
  }

  hasItem(itemName: ItemName): boolean {
    return this.trainerItems.some(item => item.name === itemName);
  }

  getItem(itemName: ItemName): ItemItem | undefined {
    return this.trainerItems.find(item => item.name === itemName);
  }

  addToItems(item: ItemItem): void {
    if (!item.sprite) {
      this.itemSpriteService.getItemSprite(item.name).subscribe(response => {
        item.sprite = response.sprite;
      });
    }
    this.trainerItems.push(item);
    this.trainerItemsObservable.next(this.trainerItems);
  }

  removeItem(item: ItemItem): void {
    const index = this.trainerItems.indexOf(item);
    if (index !== -1) {
      this.trainerItems.splice(index, 1);
    }
    this.trainerItemsObservable.next(this.trainerItems);
  }

  getBadgesObservable(): Observable<Badge[]> {
    return this.trainerBadgesObservable.asObservable();
  }

  addBadge(fromRound: number): void {
    this.badgesService.getBadge(this.generationService.getCurrentGeneration(), fromRound).subscribe(badge => {
      this.trainerBadges.push(badge);
      this.trainerBadgesObservable.next(this.trainerBadges);
    })
  }

  resetTrainer() {
    this.trainer.next({ sprite: './place-holder-pixel.png' });
  }

  resetTeam() {
    this.trainerTeam = [];
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  resetItems() {
    this.trainerItems = [];
    this.trainerItemsObservable.next(this.trainerItems);
  }

  resetBadges() {
    this.trainerBadges = [];
    this.trainerBadgesObservable.next(this.trainerBadges);
  }
}

