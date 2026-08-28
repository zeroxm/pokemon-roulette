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
import { FormRuleService } from '../form-rule-service/form-rule.service';
import { megaStoneNamesForBaseId, pokemonMegaForms } from './pokemon-mega-forms';

/** Mimikyu's disguised form; the busted form lives in `mimikyu-forms`. */
const MIMIKYU_ID = 778;

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
    private gameStateService: GameStateService,
    private formRuleService: FormRuleService) {
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
  private megaBattleBaseId: number | null = null;

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
    // Unguarded index chains here would throw on an unknown generation or gender. The data covers
    // 1-9 and GenerationService only produces those, so this cannot fire today — it is a guard
    // against a future generation being added to one table and not the other.
    const sprite = this.trainerSpriteData[generation]?.[gender];

    if (!sprite) {
      console.warn(`No trainer sprite for generation ${generation} / ${gender}; using a placeholder.`);
      return './place-holder-pixel.png';
    }
    return sprite;
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
    const changed = this.battleStates.has(gameState)
      ? this.formRuleService.applyAll(this.trainerTeam, this.storedPokemon, this.heldItemNames())
      : this.formRuleService.revertAll(this.trainerTeam, this.storedPokemon);

    if (!changed) {
      return;
    }

    if (!this.battleStates.has(gameState)) {
      this.clearMegaBattleState();
    }
    this.loadMissingSprites();
    this.trainerTeamObservable.next(this.getTeam());
  }

  private heldItemNames(): ItemName[] {
    return this.trainerItems.map(item => item.name);
  }

  /** Form swaps drop the sprite so the new form fetches its own. */
  private loadMissingSprites(): void {
    for (const collection of [this.trainerTeam, this.storedPokemon]) {
      for (const pokemon of collection) {
        this.loadPokemonSpriteIfMissing(pokemon);
      }
    }
  }

  private clearMegaBattleState(): void {
    this.megaBattleBaseId = null;
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
      } else {
        // Located by reference identity, so a stale object silently evolves nothing while the
        // caller has already consumed the item and shown the modal. Not reachable today; noisy
        // if a future path ever hands us a copy.
        console.warn(`Could not find Pokémon ${pokemonOut.pokemonId} to evolve; team unchanged.`);
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

  /** A copy, matching getTeam() and getStored(). Handing out the live array let a consumer
   *  mutate it behind the service's back. */
  getItems(): ItemItem[] {
    return [...this.trainerItems];
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

  /** Sets which base Pokémon ID will mega-evolve at battle entry. Pass null to clear. */
  /** Records that a mega evolution is claimed for this battle, so a second cannot start. */
  setMegaBattlePokemon(baseId: number | null): void {
    this.megaBattleBaseId = baseId;
  }

  /** Returns the base Pokémon ID that will mega-evolve this battle, or null if none. */
  getMegaBattleBaseId(): number | null {
    return this.megaBattleBaseId;
  }

  /** Returns true when any current team member is in a mega form. */
  hasActiveMegaFormInTeam(): boolean {
    return this.megaBattleBaseId !== null
      && this.formRuleService.isRuleActive(`mega:${this.megaBattleBaseId}`, this.trainerTeam, this.storedPokemon);
  }

  /** Applies mega evolution immediately for the selected base Pokémon during a battle. */
  forceMegaActivation(baseId: number, stoneName?: MegaStoneItemName): void {
    this.megaBattleBaseId = baseId;

    // A specific stone was tapped, so offer only that one; otherwise any held stone will do.
    const heldItems = stoneName ? [stoneName, ...this.heldItemNames()] : this.heldItemNames();
    const changed = this.formRuleService.forceApply(
      `mega:${baseId}`, this.trainerTeam, this.storedPokemon, heldItems,
    );

    if (changed) {
      this.loadMissingSprites();
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  /** True while an undisguised Mimikyu is on the team — the only thing Disguise can fire on. */
  hasDisguisedMimikyu(): boolean {
    return this.trainerTeam.some(pokemon => pokemon.pokemonId === MIMIKYU_ID);
  }

  /**
   * Breaks Mimikyu's Disguise. Sticky, so unlike mega it survives the end of the battle.
   *
   * Returns whether anything actually changed, so a caller cannot grant a retry for a bust that
   * did not happen.
   */
  bustMimikyuDisguise(): boolean {
    const changed = this.formRuleService.forceApply(
      `disguise:${MIMIKYU_ID}`, this.trainerTeam, this.storedPokemon, [],
    );

    if (changed) {
      this.loadMissingSprites();
      this.trainerTeamObservable.next(this.getTeam());
    }
    return changed;
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
    this.clearMegaBattleState();
    this.formRuleService.reset();
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

  // Reverts temporary forms only. Sticky forms intentionally persist after battle.






  /**
   * Fetches artwork for a Pokémon that has none.
   *
   * This is the only subscriber to getPokemonSprites in the app, and it had no error callback —
   * so once the service exhausted its three retries, the error surfaced as an unhandled rejection.
   * A failure is not exceptional here (offline, rate-limited, PokéAPI down); the UI already falls
   * back to a placeholder, so it is logged and left alone.
   */
  private loadPokemonSpriteIfMissing(pokemon: PokemonItem): void {
    if (pokemon.sprite) {
      return;
    }

    this.pokemonService.getPokemonSprites(pokemon.pokemonId).subscribe({
      next: response => { pokemon.sprite = response.sprite; },
      error: () => {
        console.warn(`Could not load artwork for Pokémon ${pokemon.pokemonId}; showing a placeholder.`);
      },
    });
  }

}

