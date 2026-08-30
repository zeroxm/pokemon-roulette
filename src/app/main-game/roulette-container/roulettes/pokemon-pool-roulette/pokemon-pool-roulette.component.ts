import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { POKEMON_POOLS, PokemonPool, PokemonPoolId } from './pokemon-pools';

/** Spins a wheel of Pokémon drawn from one named pool for the current generation. */
@Component({
  selector: 'app-pokemon-pool-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './pokemon-pool-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pokemon-pool-roulette.component.css'
})
export class PokemonPoolRouletteComponent implements OnInit, OnDestroy {
  @Input({ required: true }) pool!: PokemonPoolId;
  /** Battles won so far. Only pools with a `rareBoost` read it. */
  @Input() currentRound = 0;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  generation!: GenerationItem;
  pokemon: PokemonItem[] = [];

  private generationSubscription?: Subscription;

  constructor(
    private generationService: GenerationService,
    private pokemonService: PokemonService,
  ) { }

  get poolDefinition(): PokemonPool {
    return POKEMON_POOLS[this.pool];
  }

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(generation => {
      this.generation = generation;
      const ids = this.poolDefinition.idsByGeneration[generation.id] ?? [];
      this.pokemon = this.applyRareBoost(this.pokemonService.getPokemonByIdArray(ids));
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  /**
   * Emits the Pokémon as the Dex knows it, leaving any wheel-only boost behind.
   *
   * `rareBoost` widens a slice for this spin, but the boosted weight must not travel with the
   * Pokémon: every wheel built from the team binds those objects directly, so a captured Chansey
   * carrying weight 2 would keep a double-width slice on the evolution, trade and mega wheels.
   */
  onItemSelected(index: number): void {
    const chosen = this.pokemon[index];
    this.selectedPokemonEvent.emit(this.pokemonService.getPokemonById(chosen.pokemonId) ?? chosen);
  }

  /**
   * Widens this pool's rare slices once the player is far enough in.
   *
   * Builds new objects rather than assigning `weight`: `getPokemonByIdArray` hands back the shared
   * National Dex entries, so writing to them would leave Chansey at the boosted weight everywhere
   * for the rest of the session — other wheels included.
   */
  private applyRareBoost(pokemon: PokemonItem[]): PokemonItem[] {
    const boost = this.poolDefinition.rareBoost;

    if (!boost || this.currentRound < boost.fromRound) {
      return pokemon;
    }

    return pokemon.map(candidate => boost.ids.includes(candidate.pokemonId)
      ? { ...candidate, weight: boost.weight }
      : candidate);
  }
}
