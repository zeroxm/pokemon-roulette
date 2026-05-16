import { Injectable, OnDestroy } from '@angular/core';
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
import { pokemonMegaForms, megaStoneNameForBaseId } from './pokemon-mega-forms';

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
  private megaBattleOriginalPokemon: PokemonItem | null = null;

  trainerItems: ItemItem[] = [structuredClone(TrainerService.DEFAULT_POTION)];
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
      const stoneName = megaStoneNameForBaseId(baseId);
      if (stoneName !== undefined) {
        // 1:1 stone case — eligible if trainer does NOT hold the stone
        if (!this.hasItem(stoneName)) {
          seen.add(baseId);
          eligible.push(pokemon);
        }
      } else {
        // Multi-stone case (e.g. Charizard, Mewtwo, Raichu) — include as candidate;
        // T02 award logic will pick the first unheld stone via getFirstAvailableMegaStoneNameForPokemon.
        seen.add(baseId);
        eligible.push(pokemon);
      }
    }
    return eligible;
  }

  /**
   * Returns the first mega stone ItemName that the trainer does not yet hold for
   * the given Pokémon, or undefined if all applicable stones are already held.
   * For 1:1 cases this delegates to megaStoneNameForBaseId. Multi-stone expansion
   * (Charizard X/Y, Mewtwo X/Y, etc.) is left as a TODO — those Pokémon are
   * included as eligible candidates and this method returns undefined for them,
   * which the award step in T02 handles by skipping stone assignment.
   * TODO: expand to enumerate per-form stone names for multi-stone Pokémon.
   */
  getFirstAvailableMegaStoneNameForPokemon(pokemon: PokemonItem): ItemName | undefined {
    const stoneName = megaStoneNameForBaseId(pokemon.pokemonId);
    if (stoneName !== undefined && !this.hasItem(stoneName)) {
      return stoneName;
    }
    return undefined;
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
      const stoneName = megaStoneNameForBaseId(baseId);
      if (stoneName !== undefined) {
        if (this.hasItem(stoneName)) {
          seen.add(baseId);
          candidates.push(pokemon);
        }
      } else {
        // Multi-stone case: check each mega form's associated stone
        const forms = pokemonMegaForms[baseId];
        const hasAnyStone = forms.some(form => {
          const formStoneName = megaStoneNameForBaseId(form.pokemonId);
          return formStoneName !== undefined && this.hasItem(formStoneName);
        });
        if (hasAnyStone) {
          seen.add(baseId);
          candidates.push(pokemon);
        }
      }
    }
    return candidates;
  }

  /** Sets which base Pokémon ID will mega-evolve at battle entry. Pass null to clear. */
  setMegaBattlePokemon(baseId: number | null): void {
    this.megaBattleBaseId = baseId;
  }

  /** Returns the base Pokémon ID that will mega-evolve this battle, or null if none. */
  getMegaBattleBaseId(): number | null {
    return this.megaBattleBaseId;
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
    // Auto-select if exactly one candidate and none chosen yet
    if (this.megaBattleBaseId === null) {
      const candidates = this.getMegaBattleCandidates();
      if (candidates.length === 1) {
        this.megaBattleBaseId = candidates[0].pokemonId;
      }
    }
    if (this.megaBattleBaseId === null) return false;

    const baseId = this.megaBattleBaseId;
    const index = this.trainerTeam.findIndex(p => p.pokemonId === baseId);
    if (index === -1) return false;

    const forms = pokemonMegaForms[baseId];
    if (!forms) return false;

    const stoneName = megaStoneNameForBaseId(baseId);
    const megaForm = forms.find(() => stoneName !== undefined && this.hasItem(stoneName)) ?? forms[0];

    this.megaBattleOriginalPokemon = structuredClone(this.trainerTeam[index]);
    const replacement = structuredClone(megaForm);
    replacement.shiny = this.trainerTeam[index].shiny;
    replacement.sprite = null;
    this.loadPokemonSpriteIfMissing(replacement);
    this.trainerTeam[index] = replacement;
    console.log(`[Mega] Applying ${megaForm.text} for battle`);
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
      console.log(`[Mega] Reverted to base form ${original.text}`);
      break;
    }

    if (reverted) {
      this.megaBattleBaseId = null;
      this.megaBattleOriginalPokemon = null;
    }
    return reverted;
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

