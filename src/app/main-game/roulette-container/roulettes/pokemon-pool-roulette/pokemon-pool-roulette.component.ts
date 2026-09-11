import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { POKEMON_POOLS, PokemonPool, PokemonPoolId } from './pokemon-pools';
import { StatsService } from '../../../../services/stats-service/stats.service';
import { CounterKey } from '../../../../services/stats-service/counter-keys';

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
    private statsService: StatsService,
  ) { }

  /**
   * Pools whose selection is itself the catch, and the counter each feeds.
   *
   * Only these two: the legendary pool leads to a capture *attempt* that can
   * fail, and the rest have no achievement behind them.
   */
  private static readonly COUNTED_POOLS: Partial<Record<PokemonPoolId, CounterKey>> = {
    fish: 'fishing_catches',
    fossil: 'fossil_catches',
  };

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
    const counter = PokemonPoolRouletteComponent.COUNTED_POOLS[this.pool];
    if (counter) {
      this.statsService.increment(counter);
    }

    const chosen = this.pokemon[index];
    this.selectedPokemonEvent.emit(this.pokemonService.getPokemonById(chosen.pokemonId) ?? chosen);
  }

  /**
   * Widens this pool's rare slices, from the round the pool asks for or from the start.
   *
   * Builds new objects rather than assigning `weight`: `getPokemonByIdArray` hands back the shared
   * National Dex entries, so writing to them would leave Chansey at the boosted weight everywhere
   * for the rest of the session: other wheels included.
   */
  private applyRareBoost(pokemon: PokemonItem[]): PokemonItem[] {
    const boost = this.poolDefinition.rareBoost;

    if (!boost || this.currentRound < (boost.fromRound ?? 0)) {
      return pokemon;
    }

    return pokemon.map(candidate => boost.ids.includes(candidate.pokemonId)
      ? { ...candidate, weight: boost.weight }
      : candidate);
  }
}
