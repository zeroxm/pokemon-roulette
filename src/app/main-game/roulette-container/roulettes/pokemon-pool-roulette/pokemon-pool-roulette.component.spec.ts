import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PokemonPoolRouletteComponent } from './pokemon-pool-roulette.component';
import { POKEMON_POOLS, PokemonPoolId } from './pokemon-pools';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';

describe('PokemonPoolRouletteComponent', () => {
  let fixture: ComponentFixture<PokemonPoolRouletteComponent>;
  let component: PokemonPoolRouletteComponent;
  let generationService: GenerationService;

  const poolIds = Object.keys(POKEMON_POOLS) as PokemonPoolId[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()],
      imports: [PokemonPoolRouletteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonPoolRouletteComponent);
    component = fixture.componentInstance;
    generationService = TestBed.inject(GenerationService);
  });

  describe('the Safari Zone rare boost', () => {
    const CHANSEY = 113;
    const NIDORAN_F = 29;

    const loadSafari = (currentRound: number): void => {
      component.pool = 'safari';
      component.currentRound = currentRound;
      fixture.detectChanges();
    };

    const weightOf = (pokemonId: number): number | undefined =>
      component.pokemon.find(p => p.pokemonId === pokemonId)?.weight;

    it('draws evenly before the fourth gym', () => {
      loadSafari(3);

      expect(weightOf(CHANSEY)).toBe(1);
      expect(weightOf(NIDORAN_F)).toBe(1);
    });

    it('widens the prizes once the fourth gym is behind you', () => {
      loadSafari(4);

      expect(weightOf(CHANSEY)).withContext('a prize should be easier to land late').toBe(2);
      expect(weightOf(NIDORAN_F)).withContext('common species are unchanged').toBe(1);
    });

    it('does not touch the shared National Dex entry', () => {
      loadSafari(8);
      expect(weightOf(CHANSEY)).toBe(2);

      // getPokemonByIdArray hands back the dex objects themselves; boosting by assignment would
      // leave Chansey heavier on every other wheel for the rest of the session.
      const dexChansey = TestBed.inject(PokemonService).getPokemonById(CHANSEY) as PokemonItem;
      expect(dexChansey.weight).withContext('the boost must clone, not mutate').toBe(1);
    });

    it('does not let the boost travel with the captured Pokémon', () => {
      loadSafari(8);
      const index = component.pokemon.findIndex(p => p.pokemonId === CHANSEY);
      expect(component.pokemon[index].weight).withContext('boosted on the wheel').toBe(2);

      let captured: PokemonItem | undefined;
      component.selectedPokemonEvent.subscribe(p => (captured = p));
      component.onItemSelected(index);

      // Team-driven wheels bind their Pokémon straight into `[items]`, so a boosted weight here
      // would give Chansey a double-width slice on the evolution, trade and mega wheels.
      expect(captured?.pokemonId).toBe(CHANSEY);
      expect(captured?.weight).withContext('the boost is for this spin only').toBe(1);
    });

    it('leaves pools without a boost alone', () => {
      component.pool = 'cave';
      component.currentRound = 8;
      fixture.detectChanges();

      expect(component.pokemon.every(p => p.weight === 1)).toBeTrue();
    });
  });

  it('should create', () => {
    component.pool = 'fish';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // One component now serves five wheels, so every pool is exercised rather than
  // each getting its own "should create".
  for (const pool of poolIds) {
    it(`loads the ${pool} pool for the current generation`, () => {
      component.pool = pool;
      fixture.detectChanges();

      const expectedIds = POKEMON_POOLS[pool].idsByGeneration[component.generation.id] ?? [];
      expect(component.pokemon.length)
        .withContext(`${pool} should resolve every id it lists`)
        .toBe(expectedIds.length);
    });
  }

  it('reloads when the generation changes', () => {
    component.pool = 'fish';
    fixture.detectChanges();
    const firstGeneration = component.pokemon.map(p => p.pokemonId);

    generationService.setGeneration(8);   // Galar
    fixture.detectChanges();

    expect(component.pokemon.map(p => p.pokemonId)).not.toEqual(firstGeneration);
  });

  it('emits the Pokémon at the chosen index', () => {
    component.pool = 'starter';
    fixture.detectChanges();

    let emitted: PokemonItem | undefined;
    component.selectedPokemonEvent.subscribe(p => { emitted = p; });
    component.onItemSelected(1);

    expect(emitted).toBe(component.pokemon[1]);
  });

  it('names the generation for regional pools but not for starters', () => {
    expect(POKEMON_POOLS.fish.showGeneration).toBeTrue();
    expect(POKEMON_POOLS.starter.showGeneration)
      .withContext('the starter heading does not repeat the region')
      .toBeFalse();
  });

  it('every pool declares a title key and some data', () => {
    for (const pool of poolIds) {
      expect(POKEMON_POOLS[pool].titleKey).withContext(pool).toBeTruthy();
      expect(Object.keys(POKEMON_POOLS[pool].idsByGeneration).length).withContext(pool).toBeGreaterThan(0);
    }
  });
});
