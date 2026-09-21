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
import { gigantamaxForms } from './gigantamax-forms';
import { GameStateService } from '../game-state-service/game-state.service';
import { FormRuleService } from '../form-rule-service/form-rule.service';
import { StatsService } from '../stats-service/stats.service';
import { BadgeDexService } from '../badge-dex-service/badge-dex.service';
import { megaStoneNamesForBaseId, pokemonMegaForms } from './pokemon-mega-forms';

/** Mimikyu's disguised form; the busted form lives in `mimikyu-forms`. */
const MIMIKYU_ID = 778;

/** Greninja's base form; the Ash form lives in `greninja-forms`. */
const GRENINJA_ID = 658;

/** Galar. Dynamax and Gigantamax exist here and nowhere else, and mega evolution does not. */
export const GALAR_GENERATION_ID = 8;

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
    private formRuleService: FormRuleService,
    private statsService: StatsService,
    private badgeDexService: BadgeDexService) {
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
  /**
   * The most recent state seen, so the Dynamax Band knows whether a battle is happening now.
   *
   * The interlude check used to read this too. It asks `GameStateService` directly since #89:
   * comparing state names could not tell the next Elite Four battle from the current one.
   */
  private currentGameState: GameState | null = null;
  /**
   * The lead's Max state for the current battle. Null outside battles, and outside Galar.
   *
   * Deliberately here rather than a flag on the `PokemonItem`. The item is `structuredClone`d into
   * the PC, the Pokedex and the sync snapshot, so a flag on it would leak into all three and
   * outlive the fight it belongs to.
   */
  private maxState: { pokemon: PokemonItem; fromId: number; gigantamax: boolean } | null = null;
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
    // Unreachable today: GenerationService only produces 1-9, which the data covers. Guards
    // against a future generation reaching one table and not the other.
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
    this.currentGameState = gameState;

    if (this.isBattleInterlude(gameState)) {
      return;
    }

    const entering = this.battleStates.has(gameState);

    const changed = entering
      ? this.formRuleService.applyAll(this.trainerTeam, this.storedPokemon, this.heldItemNames())
      : this.formRuleService.revertAll(this.trainerTeam, this.storedPokemon);

    // Dynamax lasts one battle, like a mega. Leaving clears it whether or not a form reverted:
    // a plain Dynamax changes no form, so `changed` alone would miss it.
    const maxCleared = !entering && this.maxState !== null;
    if (!entering) {
      this.maxState = null;
    }

    if (!changed && !maxCleared) {
      return;
    }

    if (!entering) {
      this.clearMegaBattleState();
    }
    this.loadMissingSprites();
    this.trainerTeamObservable.next(this.getTeam());
  }

  /**
   * Dynamaxes the lead for this battle, on the player tapping the Dynamax Band.
   *
   * Manual rather than automatic, and on the lead rather than a free choice, which together are
   * what give the player something to decide: the decision is made in the PC, by choosing who
   * leads, and then taken in the fight.
   *
   * Every Pokemon can Dynamax, which is why the flag is the mechanic and the form rule is only
   * the extra. A species with a Gigantamax form swaps sprite through `gmax:<id>`; everything else
   * just gets bigger and keeps its own.
   *
   * Returns whether it happened, so the caller knows whether to play the cinematic.
   */
  activateMax(): boolean {
    // Same gate the button reads, checked again here rather than trusted. The tap arrives through
    // a Subject, so it can land a beat after the battle it was meant for has ended.
    if (!this.canActivateMax()) {
      return false;
    }

    const lead = this.trainerTeam[0];

    // Read before the rule runs: afterwards the lead may already be a Gigantamax form, and a
    // Gigantamax id belongs to no species, so resolving one from it lands on nothing and the
    // Pokedex gets a phantom entry for a form nobody caught.
    const fromId = lead.pokemonId;
    const gigantamax = gigantamaxForms[fromId] !== undefined;

    if (gigantamax) {
      this.formRuleService.forceApply(
        `gmax:${fromId}`, this.trainerTeam, this.storedPokemon, this.heldItemNames(), lead);
    }

    this.maxState = { pokemon: this.trainerTeam[0], fromId, gigantamax };
    this.loadMissingSprites();
    this.trainerTeamObservable.next(this.getTeam());
    return true;
  }

  /**
   * Moves every form ladder one rung, on a battle being won.
   *
   * Called from the win branch rather than on entering a fight: a rung is a reward for the
   * victory. Fired on gym and Elite Four wins; the champion win ends the run on the next line, so
   * advancing there would change nothing the player could see.
   */
  advanceFormLaddersAfterWin(): void {
    if (!this.formRuleService.applyWon(this.trainerTeam, this.storedPokemon, this.heldItemNames())) {
      return;
    }

    this.loadMissingSprites();
    this.trainerTeamObservable.next(this.getTeam());
  }

  /** Whether the lead can still Dynamax: Galar, in a battle, and not already Maxed. */
  canActivateMax(): boolean {
    return this.maxState === null
      && this.trainerTeam.length > 0
      && this.generationService.getCurrentGeneration().id === GALAR_GENERATION_ID
      && this.currentGameState !== null
      && this.battleStates.has(this.currentGameState);
  }

  /** The lead's Max state for this battle, or null. Read by the battle odds and the team panel. */
  getMaxState(): { pokemon: PokemonItem; fromId: number; gigantamax: boolean } | null {
    return this.maxState;
  }

  /**
   * A detour the player comes straight back from, rather than the end of a battle.
   *
   * A Rare Candy is tappable mid-fight. Using one pushes the battle back onto the stack and
   * routes through the evolution states, so the emissions read `gym-battle` ->
   * `select-from-pokemon-list` -> ... -> `gym-battle`. Treating those as "battle over" reverts
   * every temporary form and clears the guards: an active mega silently vanishes and re-arms for
   * a second use, and Aegislash toggles back to Shield.
   *
   * Keyed on `repeatCurrentState` having been called, not on the next queued state matching the
   * one just left. That earlier version looked equivalent and was not: **the Elite Four queues
   * four battles that all carry the name `elite-four-battle`**, so moving from the first to the
   * second looked exactly like coming back to the first, and every temporary form survived from
   * one Elite Four member to the next. Gyms were unaffected only because `adventure-continues`
   * sits between them.
   *
   * Asking the state machine also covers a detour more than one state deep, which the comparison
   * could never do: it only ever saw the first hop out of the battle.
   */
  private isBattleInterlude(current: GameState): boolean {
    if (this.battleStates.has(current)) {
      return false;
    }

    const resuming = this.gameStateService.resumingState;
    return resuming !== null && this.battleStates.has(resuming);
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
        // Located by reference identity: a stale copy would silently evolve nothing after the
        // caller had already consumed the item and shown the modal.
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
  forceMegaActivation(target: PokemonItem, stoneName?: MegaStoneItemName): void {
    const baseId = target.pokemonId;
    this.megaBattleBaseId = baseId;

    // Offer *only* the tapped stone. The rule scans its own forms in order rather than the list it
    // is handed, so passing the others would let forms[0] win whichever stone the player tapped.
    const heldItems = stoneName && this.hasItem(stoneName) ? [stoneName] : this.heldItemNames();
    // The tapped Pokémon, by identity. Passing only the species mega evolved
    // every copy of it on the team.
    const changed = this.formRuleService.forceApply(
      `mega:${baseId}`, this.trainerTeam, this.storedPokemon, heldItems, target,
    );

    if (changed) {
      this.loadMissingSprites();
      this.trainerTeamObservable.next(this.getTeam());
    }
  }

  /** True while an undisguised Mimikyu is on the team: the only thing Disguise can fire on. */
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
      this.statsService.increment('mimikyu_disguises_busted');
      this.trainerTeamObservable.next(this.getTeam());
    }
    return changed;
  }

  /** True while a base-form Greninja is on the team: the only thing the Ash transformation fires on. */
  hasBaseGreninja(): boolean {
    return this.trainerTeam.some(pokemon => pokemon.pokemonId === GRENINJA_ID);
  }

  /**
   * Turns a base Greninja into Ash-Greninja. No stone involved; the caller decides the trigger.
   *
   * Returns whether anything changed, so a caller cannot play a transformation animation for a
   * transformation that did not happen.
   */
  transformAshGreninja(): boolean {
    const changed = this.formRuleService.forceApply(
      `ash-greninja:${GRENINJA_ID}`, this.trainerTeam, this.storedPokemon, [],
    );

    if (changed) {
      this.loadMissingSprites();
      this.statsService.increment('ash_greninja_transformations');
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
      // One point for every badge the game awards: the run's badges die with
      // it, the badge dex is the lifetime trophy case.
      this.badgeDexService.record(badge);
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








  /**
   * Fetches artwork for a Pokémon that has none.
   *
   * This is the only subscriber to getPokemonSprites in the app, and it had no error callback:
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

