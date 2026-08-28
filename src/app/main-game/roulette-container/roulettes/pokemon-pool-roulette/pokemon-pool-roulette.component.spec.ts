import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PokemonPoolRouletteComponent } from './pokemon-pool-roulette.component';
import { POKEMON_POOLS, PokemonPoolId } from './pokemon-pools';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

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

  it('should create', () => {
    component.pool = 'fish';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // One component now serves five wheels, so every pool is exercised rather than
  // each getting its own "should create".
  for (const pool of ['fish', 'fossil', 'legendary', 'starter', 'cave'] as PokemonPoolId[]) {
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
