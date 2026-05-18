import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { trainerSpriteData } from './trainer-sprite-data';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonService } from '../pokemon-service/pokemon.service';
import { EvolutionService } from '../evolution-service/evolution.service';
import { ItemItem } from '../../interfaces/item-item';
import { ItemSpriteService } from '../item-sprite-service/item-sprite.service';
import { ItemName, MegaStoneItemName } from '../items-service/item-names';
import { Badge } from '../../interfaces/badge';
import { BadgesService } from '../badges-service/badges.service';
import { GenerationService } from '../generation-service/generation.service';
import { GameState } from '../game-state-service/game-state';
import { GameStateService } from '../game-state-service/game-state.service';
import { palafinForms } from './palafin-forms';
import { stickyBattleForms } from './sticky-battle-forms';
import { megaStoneNamesForBaseId, pokemonMegaForms } from './pokemon-mega-forms';

@Injectable({
  providedIn: 'root'
})
export class TrainerService implements OnDestroy {

  private static readonly DEFAULT_POTION: ItemItem = {
    text: 'items.potion.name',
    name: 'potion',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
    fillStyle: 'purple',
    weight: 1,
    description: 'items.potion.description'
  };

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
  private megaBattleBaseId: number | null = null;
  private megaBattleStoneName: MegaStoneItemName | null = null;
  private megaBattleOriginalPokemon: PokemonItem | null = null;

  trainerItems: ItemItem[] = [
    structuredClone(TrainerService.DEFAULT_POTION)
  ];
  private trainerItemsObservable = new BehaviorSubject<ItemItem[]>(this.trainerItems);

  trainerBadges: Badge[] = [];

  private trainerBadgesObservable = new BehaviorSubject<Badge[]>(this.trainerBadges);

  ngOnDestroy(): void {
    this.gameStateSubscription.unsubscribe();
  }

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

    pokemon = structuredClone(pokemon);
    this.loadPokemonSpriteIfMissing(pokemon);

    if(this.trainerTeam.length < 6) {
      this.trainerTeam.push(pokemon);
    } else {
      this.storedPokemon.push(pokemon);
    }

    this.lastAddedPokemon = pokemon;
    this.trainerTeamObservable.next(this.getTeam());
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
  }

  getTeam(): PokemonItem[] {
    return [...this.trainerTeam];
  }

  updateTeam(): void {
    this.trainerTeamObservable.next(this.getTeam());
  }

  commitTeamAndStorage(team: PokemonItem[], stored: PokemonItem[]): void {
    this.trainerTeam = [...team];
    this.storedPokemon = [...stored];
    this.trainerTeamObservable.next(this.getTeam());
  }

  getStored(): PokemonItem[] {
    return [...this.storedPokemon];
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

  private syncBattleForms(gameState: GameState): void {
    if (this.battleStates.has(gameState)) {
      this.applyBattleForms();
      return;
    }

    this.revertBattleForms();
  }

  replaceForEvolution(pokemonOut: PokemonItem, pokemonIn: PokemonItem): void {
    pokemonIn.shiny = pokemonOut.shiny;
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

    item = structuredClone(item);

    if (!item.sprite) {
      this.itemSpriteService.getItemSprite(item.name).subscribe(response => {
        if (response) item.sprite = response.sprite;
      });
    }
    this.trainerItems.push(item);
    this.trainerItemsObservable.next(this.trainerItems);
  }

  /**
   * Returns team Pokémon that are mega-capable and for which at least one mega stone
   * is not yet held by the trainer. Deduplicated by base Pokémon ID.
   */
  getMegaStoneEligiblePokemon(): PokemonItem[] {
    const seen = new Set<number>();
    const eligible: PokemonItem[] = [];
    for (const pokemon of this.getTeam()) {
      const baseId = pokemon.pokemonId;
      if (!pokemonMegaForms[baseId]) continue;
      if (seen.has(baseId)) continue;
      if (this.getAvailableMegaStoneNamesForPokemon(pokemon).length > 0) {
        seen.add(baseId);
        eligible.push(pokemon);
      }
    }
    return eligible;
  }

  /**
   * Returns mega stone names for the given Pokémon that the trainer does not yet hold.
   */
  getAvailableMegaStoneNamesForPokemon(pokemon: PokemonItem): MegaStoneItemName[] {
    return megaStoneNamesForBaseId(pokemon.pokemonId).filter(stoneName => !this.hasItem(stoneName));
  }

  getHeldMegaStoneNamesForPokemon(pokemon: PokemonItem): MegaStoneItemName[] {
    return megaStoneNamesForBaseId(pokemon.pokemonId).filter(stoneName => this.hasItem(stoneName));
  }

  getFirstAvailableMegaStoneNameForPokemon(pokemon: PokemonItem): MegaStoneItemName | undefined {
    return this.getAvailableMegaStoneNamesForPokemon(pokemon)[0];
  }

  /**
   * Returns team members (deduplicated by pokemonId) whose base pokemonId exists
   * in pokemonMegaForms AND for whom at least one mega stone is held.
   */
  getMegaBattleCandidates(): PokemonItem[] {
    const seen = new Set<number>();
    const candidates: PokemonItem[] = [];
    for (const pokemon of this.trainerTeam) {
      const baseId = pokemon.pokemonId;
      if (seen.has(baseId)) continue;
      if (!pokemonMegaForms[baseId]) continue;
      if (this.getHeldMegaStoneNamesForPokemon(pokemon).length > 0) {
        seen.add(baseId);
        candidates.push(pokemon);
      }
    }
    return candidates;
  }

  /** Sets which base Pokémon ID will mega-evolve at battle entry. Pass null to clear. */
  setMegaBattlePokemon(baseId: number | null, stoneName: MegaStoneItemName | null = null): void {
    this.megaBattleBaseId = baseId;
    this.megaBattleStoneName = baseId === null ? null : stoneName;
  }

  /** Returns the base Pokémon ID that will mega-evolve this battle, or null if none. */
  getMegaBattleBaseId(): number | null {
    return this.megaBattleBaseId;
  }

  /** Returns true when any current team member is in a mega form. */
  hasActiveMegaFormInTeam(): boolean {
    const megaFormIds = new Set<number>();
    for (const forms of Object.values(pokemonMegaForms)) {
      for (const form of forms) {
        megaFormIds.add(form.pokemonId);
      }
    }

    return this.trainerTeam.some(pokemon => megaFormIds.has(pokemon.pokemonId));
  }

  /** Applies mega evolution immediately for the selected base Pokémon during a battle. */
  forceMegaActivation(baseId: number, stoneName?: MegaStoneItemName): void {
    this.megaBattleBaseId = baseId;
    this.megaBattleStoneName = stoneName ?? this.resolveMegaStoneForBattle(baseId);
    const changed = this.applyMegaForms();
    if (changed) {
      this.trainerTeamObservable.next(this.getTeam());
    }
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
      if (badge === undefined) return;
      this.trainerBadges.push(badge);
      this.trainerBadgesObservable.next(this.trainerBadges);
    })
  }

  resetTrainer() {
    this.trainer.next({ sprite: './place-holder-pixel.png' });
  }

  resetTeam() {
    this.trainerTeam = [];
    this.storedPokemon = [];
    this.trainerTeamObservable.next(this.trainerTeam);
  }

  resetItems() {
    this.trainerItems = [structuredClone(TrainerService.DEFAULT_POTION)];
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
    changed = this.applyMegaForms() || changed;

    if (changed) {
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  // Reverts temporary forms only. Sticky forms intentionally persist after battle.
  private revertBattleForms(): void {
    let changed = false;
    changed = this.replaceTemporaryForms(this.trainerTeam, false) || changed;
    changed = this.replaceTemporaryForms(this.storedPokemon, false) || changed;
    changed = this.revertMegaForms() || changed;

    if (changed) {
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  private applyMegaForms(): boolean {
    if (this.megaBattleBaseId === null) return false;

    const baseId = this.megaBattleBaseId;
    const index = this.trainerTeam.findIndex(p => p.pokemonId === baseId);
    if (index === -1) return false;

    const forms = pokemonMegaForms[baseId];
    if (!forms) return false;

    const stoneName = this.resolveMegaStoneForBattle(baseId);
    if (!stoneName) return false;

    const megaForm = this.getMegaFormForStone(baseId, stoneName);
    if (!megaForm) return false;

    this.megaBattleOriginalPokemon = structuredClone(this.trainerTeam[index]);
    const replacement = structuredClone(megaForm);
    replacement.shiny = this.trainerTeam[index].shiny;
    replacement.sprite = null;
    this.loadPokemonSpriteIfMissing(replacement);
    this.trainerTeam[index] = replacement;
    return true;
  }

  private revertMegaForms(): boolean {
    if (!this.megaBattleOriginalPokemon) return false;

    const original = this.megaBattleOriginalPokemon;
    const megaIdToBaseId = new Map<number, number>();
    for (const [baseIdStr, forms] of Object.entries(pokemonMegaForms)) {
      const baseId = Number(baseIdStr);
      for (const form of forms) {
        megaIdToBaseId.set(form.pokemonId, baseId);
      }
    }

    let reverted = false;
    for (let i = 0; i < this.trainerTeam.length; i++) {
      const pokemon = this.trainerTeam[i];
      const baseId = megaIdToBaseId.get(pokemon.pokemonId);
      if (baseId === undefined || baseId !== original.pokemonId) continue;

      const replacement = structuredClone(original);
      replacement.shiny = pokemon.shiny;
      replacement.sprite = null;
      this.loadPokemonSpriteIfMissing(replacement);
      this.trainerTeam[i] = replacement;
      reverted = true;
      break;
    }

    if (reverted) {
      this.megaBattleBaseId = null;
      this.megaBattleStoneName = null;
      this.megaBattleOriginalPokemon = null;
    }
    return reverted;
  }

  private resolveMegaStoneForBattle(baseId: number): MegaStoneItemName | null {
    if (this.megaBattleStoneName && this.hasItem(this.megaBattleStoneName)) {
      return this.megaBattleStoneName;
    }

    const heldStoneNames = megaStoneNamesForBaseId(baseId).filter(stoneName => this.hasItem(stoneName));
    return heldStoneNames[0] ?? null;
  }

  private getMegaFormForStone(baseId: number, stoneName: MegaStoneItemName): PokemonItem | null {
    const forms = pokemonMegaForms[baseId];
    if (!forms || forms.length === 0) {
      return null;
    }

    const stoneNames = megaStoneNamesForBaseId(baseId);
    const stoneIndex = stoneNames.indexOf(stoneName);
    if (stoneIndex === -1) {
      return forms[0] ?? null;
    }

    return forms[stoneIndex] ?? forms[0] ?? null;
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

