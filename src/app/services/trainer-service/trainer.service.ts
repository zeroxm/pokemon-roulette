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

  private trainer = new BehaviorSubject<{ sprite: string }>({ sprite: './place-holder-pixel.png' });
  gender: string = 'male';

  trainerTeam: PokemonItem[] = [];
  private trainerTeamObservable = new BehaviorSubject<PokemonItem[]>(this.trainerTeam);
  private lastPokemonAddedIndex: number = 0;

  trainerItems: ItemItem[] = [
    {
      text: 'Potion',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'Potion let you spin again whenever you would lose a Gym battle!'
    },
  ];
  private trainerItemsObservable = new BehaviorSubject<ItemItem[]>(this.trainerItems);

  trainerBadges: Badge[] = [];
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
    this.trainerTeamObservable.next(this.getTeam());
  }

  removeFromTeam(pokemon: PokemonItem): void {
    const index = this.trainerTeam.indexOf(pokemon);
    if (index !== -1) {
      this.trainerTeam.splice(index, 1);
    }
    this.trainerTeamObservable.next(this.getTeam());
  }

  getTeam(): PokemonItem[] {
    return this.trainerTeam.slice(0, 6);
  }

  getTeamObservable(): Observable<PokemonItem[]> {
    return this.trainerTeamObservable.asObservable();
  }

  makeShiny(): void {
    this.trainerTeam[this.lastPokemonAddedIndex].shiny = true;
    this.trainerTeamObservable.next(this.getTeam());
  }

  getPokemonThatCanEvolve(): PokemonItem[] {
    const auxPokemonList: PokemonItem[] = [];
    this.trainerTeam.slice(0, 6).forEach(pokemon => {
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
    this.trainerTeamObservable.next(this.getTeam());
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
    this.trainerTeamObservable.next(this.getTeam());
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

  addBadge(fromRound: number, fromLeader: number = 0): void {
    this.badgesService.getBadge(this.generationService.getCurrentGeneration(), fromRound, fromLeader).subscribe(badge => {
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
    this.trainerItems = [
      {
        text: 'Potion',
        name: 'potion',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
        fillStyle: 'purple',
        weight: 1,
        description: 'Potion let you spin again whenever you would lose a Gym battle!'
      },
    ];
    this.trainerItemsObservable.next(this.trainerItems);
  }

  resetBadges() {
    this.trainerBadges = [];
    this.trainerBadgesObservable.next(this.trainerBadges);
  }
}

