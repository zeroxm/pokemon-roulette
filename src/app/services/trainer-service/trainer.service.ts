import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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
import { GameState } from '../game-state-service/game-state';
import { GameStateService } from '../game-state-service/game-state.service';
import { palafinForms } from './palafin-forms';
import { stickyBattleForms } from './sticky-battle-forms';

interface TrainerSave {
  trainerTeam: PokemonItem[];
  storedPokemon: PokemonItem[];
  trainerItems: ItemItem[];
  trainerBadges: Badge[];
  gender: string;
  trainerSprite: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainerService {

  private readonly SAVE_KEY = 'pokemon-roulette-trainer';
  private readonly gameStateSubscription: Subscription;

  constructor(private badgesService: BadgesService,
    private evolutionService: EvolutionService,
    private generationService: GenerationService,
    private itemSpriteService: ItemSpriteService,
    private pokemonService: PokemonService,
    private gameStateService: GameStateService) {
    this.gameStateSubscription = this.gameStateService.currentState.subscribe((gameState) => {
      this.syncBattleForms(gameState);
    });
  }

  trainerSpriteData = trainerSpriteData;

  private trainer = new BehaviorSubject<{ sprite: string }>({ sprite: './place-holder-pixel.png' });
  gender: string = 'male';

  trainerTeam: PokemonItem[] = [];

  storedPokemon: PokemonItem[] = [];

  private trainerTeamObservable = new BehaviorSubject<PokemonItem[]>(this.trainerTeam);
  private lastAddedPokemon: PokemonItem | null = null;
  private readonly battleStates = new Set<GameState>(['gym-battle', 'elite-four-battle', 'champion-battle']);
  private readonly temporaryBattleForms = palafinForms;
  private readonly stickyBattleFormGroups = stickyBattleForms;

  trainerItems: ItemItem[] = [
    {
      text: 'items.potion.name',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'items.potion.description'
    }
  ];
  private trainerItemsObservable = new BehaviorSubject<ItemItem[]>(this.trainerItems);

  trainerBadges: Badge[] = [];

  private trainerBadgesObservable = new BehaviorSubject<Badge[]>(this.trainerBadges);

  ngOnDestroy(): void {
    this.gameStateSubscription.unsubscribe();
  }

  // --- Save / Load ---

  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  loadFromSave(): boolean {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return false;
    try {
      const save: TrainerSave = JSON.parse(raw);
      this.trainerTeam = save.trainerTeam;
      this.storedPokemon = save.storedPokemon;
      this.trainerItems = save.trainerItems;
      this.trainerBadges = save.trainerBadges;
      this.gender = save.gender;
      this.trainer.next({ sprite: save.trainerSprite });

      // Reload sprites for all pokemon
      [...this.trainerTeam, ...this.storedPokemon].forEach(p => this.loadPokemonSpriteIfMissing(p));

      this.trainerTeamObservable.next(this.trainerTeam);
      this.trainerItemsObservable.next(this.trainerItems);
      this.trainerBadgesObservable.next(this.trainerBadges);
      return true;
    } catch {
      this.clearSave();
      return false;
    }
  }

  clearSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  private saveToStorage(): void {
    const save: TrainerSave = {
      trainerTeam: this.trainerTeam,
      storedPokemon: this.storedPokemon,
      trainerItems: this.trainerItems,
      trainerBadges: this.trainerBadges,
      gender: this.gender,
      trainerSprite: this.trainer.value.sprite
    };
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(save));
  }

  // --- Trainer ---

  getTrainer(): Observable<{ sprite: string }> {
    return this.trainer.asObservable();
  }

  getTrainerSprite(generation: number, gender: string): string {
    return this.trainerSpriteData[generation][gender];
  }

  setTrainer(generation: number, gender: string) {
    this.gender = gender;
    this.trainer.next({ sprite: this.getTrainerSprite(generation, gender) });
    this.saveToStorage();
  }

  // --- Team ---

  addToTeam(pokemon: PokemonItem): void {

    pokemon = structuredClone(pokemon);
    this.loadPokemonSpriteIfMissing(pokemon);

    if(this.trainerTeam.length < 6) {
      this.trainerTeam.push(pokemon);
    } else {
      this.storedPokemon.push(pokemon);
    }

    this.lastAddedPokemon = pokemon;
    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  removeFromTeam(pokemon: PokemonItem): void {
    let index = this.trainerTeam.indexOf(pokemon);

    if (index !== -1) {
      this.trainerTeam.splice(index, 1);
    } else {
      index = this.storedPokemon.indexOf(pokemon);
      if(index !== -1) {
        this.storedPokemon.splice(index, 1);
      }
    }

    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  getTeam(): PokemonItem[] {
    return this.trainerTeam;
  }

  updateTeam(): void {
    this.trainerTeamObservable.next(this.trainerTeam);
    this.saveToStorage();
  }

  getStored(): PokemonItem[] {
    return this.storedPokemon;
  }

  getTeamObservable(): Observable<PokemonItem[]> {
    return this.trainerTeamObservable.asObservable();
  }

  makeShiny(): void {
    const lastAddedIndex = this.trainerTeam.findIndex(pokemon => pokemon === this.lastAddedPokemon);
    if (lastAddedIndex !== -1) {
      this.trainerTeam[lastAddedIndex].shiny = true;
    } else {
      const storedIndex = this.storedPokemon.findIndex(pokemon => pokemon === this.lastAddedPokemon);
      if (storedIndex !== -1) {
        this.storedPokemon[storedIndex].shiny = true;
      }
    }
    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  getPokemonThatCanEvolve(): PokemonItem[] {
    const auxPokemonList: PokemonItem[] = [];
    this.trainerTeam.forEach(pokemon => {
      if (this.evolutionService.canEvolve(pokemon) && !pokemon.fainted) {
        auxPokemonList.push(pokemon);
      }
    });
    return auxPokemonList;
  }

  // --- Nuzlocke ---

  faintWeakestPokemon(): PokemonItem | null {
    const alive = this.trainerTeam.filter(p => !p.fainted);
    if (alive.length === 0) return null;
    const weakest = alive.reduce((a, b) => a.power < b.power ? a : b);
    weakest.fainted = true;
    this.trainerTeamObservable.next([...this.trainerTeam]);
    this.saveToStorage();
    return weakest;
  }

  isWhiteout(): boolean {
    return this.trainerTeam.every(p => p.fainted);
  }

  // --- Item Crafting ---

  releasePokemon(pokemon: PokemonItem[]): void {
    const idsToRelease = new Set(pokemon);
    this.storedPokemon = this.storedPokemon.filter(p => !idsToRelease.has(p));
    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  // --- Battle Forms ---

  private syncBattleForms(gameState: GameState): void {
    if (this.battleStates.has(gameState)) {
      this.applyBattleForms();
      return;
    }

    this.revertBattleForms();
  }

  replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    pokemonIn.shiny = pokemonOut.shiny;
    pokemonIn = pokemonIn;
    this.loadPokemonSpriteIfMissing(pokemonIn);

    let index = this.trainerTeam.indexOf(pokemonOut);

    if (index > -1) {
      this.trainerTeam.splice(index, 1, pokemonIn);
    } else {
      index = this.storedPokemon.indexOf(pokemonOut);
      if (index > -1) {
        this.storedPokemon.splice(index, 1, pokemonIn);
      }
    }

    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  performTrade(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    this.loadPokemonSpriteIfMissing(pokemonIn);

    let index = this.trainerTeam.indexOf(pokemonOut);
    if (index > -1) {
      this.trainerTeam.splice(index, 1, pokemonIn);
    } else {
      index = this.storedPokemon.indexOf(pokemonOut);
      if (index > -1) {
        this.storedPokemon.splice(index, 1, pokemonIn);
      }
    }
    this.trainerTeamObservable.next(this.getTeam());
    this.saveToStorage();
  }

  // --- Items ---

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

    item = structuredClone(item);

    if (!item.sprite) {
      this.itemSpriteService.getItemSprite(item.name).subscribe(response => {
        item.sprite = response.sprite;
      });
    }
    this.trainerItems.push(item);
    this.trainerItemsObservable.next(this.trainerItems);
    this.saveToStorage();
  }

  removeItem(item: ItemItem): void {
    const index = this.trainerItems.indexOf(item);
    if (index !== -1) {
      this.trainerItems.splice(index, 1);
    }
    this.trainerItemsObservable.next(this.trainerItems);
    this.saveToStorage();
  }

  // --- Badges ---

  getBadgesObservable(): Observable<Badge[]> {
    return this.trainerBadgesObservable.asObservable();
  }

  addBadge(fromRound: number, fromLeader: number = 0): void {
    this.badgesService.getBadge(this.generationService.getCurrentGeneration(), fromRound, fromLeader).subscribe(badge => {
      this.trainerBadges.push(badge);
      this.trainerBadgesObservable.next(this.trainerBadges);
      this.saveToStorage();
    })
  }

  // --- Resets ---

  resetTrainer() {
    this.trainer.next({ sprite: './place-holder-pixel.png' });
  }

  resetTeam() {
    this.trainerTeam = [];
    this.storedPokemon = [];
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  resetItems() {
    this.trainerItems = [
      {
        text: 'items.potion.name',
        name: 'potion',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
        fillStyle: 'purple',
        weight: 1,
        description: 'items.potion.description'
      }
    ];
    this.trainerItemsObservable.next(this.trainerItems);
  }

  resetBadges() {
    this.trainerBadges = [];
    this.trainerBadgesObservable.next(this.trainerBadges);
  }

  // Applies all battle-entry transforms in one pass with a single emit.
  // Temporary forms apply to team+stored; sticky forms apply to team only.
  private applyBattleForms(): void {
    let changed = false;
    changed = this.replaceTemporaryForms(this.trainerTeam, true) || changed;
    changed = this.replaceTemporaryForms(this.storedPokemon, true) || changed;
    changed = this.applyStickyFormsToCollection(this.trainerTeam) || changed;

    if (changed) {
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  // Reverts temporary forms only. Sticky forms intentionally persist after battle.
  private revertBattleForms(): void {
    let changed = false;
    changed = this.replaceTemporaryForms(this.trainerTeam, false) || changed;
    changed = this.replaceTemporaryForms(this.storedPokemon, false) || changed;

    if (changed) {
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  private applyStickyFormsToCollection(collection: PokemonItem[]): boolean {
    let replaced = false;

    this.stickyBattleFormGroups.forEach(group => {
      const formIds = new Set(group.forms.map(f => f.pokemonId));

      collection.forEach((pokemon, index) => {
        if (!formIds.has(pokemon.pokemonId)) {
          return;
        }

        const currentFormIndex = group.forms.findIndex(f => f.pokemonId === pokemon.pokemonId);
        let targetForm: PokemonItem;

        if (group.mode === 'toggle') {
          targetForm = group.forms[(currentFormIndex + 1) % group.forms.length];
        } else {
          const otherForms = group.forms.filter(f => f.pokemonId !== pokemon.pokemonId);
          targetForm = otherForms[Math.floor(Math.random() * otherForms.length)];
        }

        const replacement = structuredClone(targetForm);
        replacement.shiny = pokemon.shiny;
        replacement.sprite = null;
        this.loadPokemonSpriteIfMissing(replacement);
        collection[index] = replacement;
        replaced = true;
      });
    });

    return replaced;
  }

  private loadPokemonSpriteIfMissing(pokemon: PokemonItem): void {
    if (!pokemon.sprite) {
      this.pokemonService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
        pokemon.sprite = response.sprite;
      });
    }
  }

  private replaceTemporaryForms(collection: PokemonItem[], transformToBattleForm: boolean): boolean {
    let replaced = false;

    Object.values(this.temporaryBattleForms).forEach(forms => {
      if (forms.length < 2) {
        return;
      }

      const baseForm = forms[0];
      const battleForm = forms[1];
      const sourceId = transformToBattleForm ? baseForm.pokemonId : battleForm.pokemonId;
      const targetForm = transformToBattleForm ? battleForm : baseForm;

      collection.forEach((pokemon, index) => {
        if (pokemon.pokemonId !== sourceId) {
          return;
        }

        const replacement = structuredClone(targetForm);
        replacement.shiny = pokemon.shiny;
        replacement.sprite = null;
        this.loadPokemonSpriteIfMissing(replacement);
        collection[index] = replacement;
        replaced = true;
      });
    });

    return replaced;
  }
}
