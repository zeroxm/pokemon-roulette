import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  bootstrapArrowRepeat,
  bootstrapBook,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
} from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { GameStateService } from '../../services/game-state-service/game-state.service';
import { PokedexService } from '../../services/pokedex-service/pokedex.service';

import { RouletteContainerComponent } from './roulette-container.component';
import { ModalQueueService } from '../../services/modal-queue-service/modal-queue.service';

describe('RouletteContainerComponent', () => {
  let component: RouletteContainerComponent;
  let fixture: ComponentFixture<RouletteContainerComponent>;
  let pokemonService: PokemonService;
  let trainerService: TrainerService;
  let gameStateService: GameStateService;
  let pokedexService: PokedexService;
  let modalQueueService: ModalQueueService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteContainerComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({
          bootstrapArrowRepeat,
          bootstrapBook,
          bootstrapCheck,
          bootstrapClock,
          bootstrapController,
          bootstrapCupHotFill,
          bootstrapGear,
          bootstrapMap,
          bootstrapPcDisplayHorizontal,
          bootstrapPeopleFill,
          bootstrapShare,
        }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteContainerComponent);
    component = fixture.componentInstance;
    pokemonService = TestBed.inject(PokemonService);
    trainerService = TestBed.inject(TrainerService);
    gameStateService = TestBed.inject(GameStateService);
    pokedexService = TestBed.inject(PokedexService);
    modalQueueService = TestBed.inject(ModalQueueService);
    gameStateService.resetGameState();
    trainerService.resetTeam();
    localStorage.clear();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route to form selection when captured pokemon has multiple forms', () => {
    const deoxys = pokemonService.getPokemonById(386);
    expect(deoxys).toBeDefined();

    component.capturePokemon(deoxys!);

    expect(component.getGameState()).toBe('select-form');
    expect(component.pokemonForms.map(form => form.pokemonId)).toEqual([386, 10001, 10002, 10003]);
    expect(trainerService.getTeam().length).toBe(0);
  });

  it('should capture immediately when pokemon has no forms', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    component.capturePokemon(bulbasaur!);

    expect(component.getGameState()).toBe('check-shininess');
    expect(trainerService.getTeam().length).toBe(1);
    expect(trainerService.getTeam()[0].pokemonId).toBe(1);
  });

  it('should register base national dex ID in Pokédex when alt form is selected — ALT-FORM-01', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();
    component.capturePokemon(raichu!);

    // Select Alolan Raichu form (pokemonId 10100)
    const forms = component.pokemonForms;
    const alolanRaichu = forms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Base national dex entry (26) should be registered
    expect(pokedexService.currentPokedex.caught['26']).toBeTruthy();
  });

  // ALT-FORM-02: shiny alt form propagates shiny flag to base national dex entry
  it('should propagate shiny flag to base national dex entry when shiny alt form captured — ALT-FORM-02', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();
    const shinyRaichu = { ...raichu!, shiny: true };
    component.capturePokemon(shinyRaichu);

    const forms = component.pokemonForms;
    const alolanRaichu = forms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Base entry should have shiny: true
    expect(pokedexService.currentPokedex.caught['26']?.shiny).toBeTrue();
  });

  // SHINY-03: shiny flag must be persisted to Pokédex after shiny roulette
  it('should update Pokédex entry with shiny: true after setShininess(true) — SHINY-03', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    // Capture Bulbasaur (no forms → goes straight to check-shininess)
    component.capturePokemon(bulbasaur!);

    // Simulate shiny roulette resolving to shiny
    component.setShininess(true);

    expect(pokedexService.currentPokedex.caught['1']?.shiny).toBeTrue();
  });

  it('should mark base national dex ID as won after Champion win with alt-form on team — ALTW-01', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();

    // Capture Raichu → triggers form selection
    component.capturePokemon(raichu!);

    // Select Alolan Raichu form (pokemonId 10100) — adds alt-form to team
    const alolanRaichu = component.pokemonForms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Beat the Champion
    component.championBattleResult(true);

    // Base national dex entry (26 = Raichu) must be marked won
    expect(pokedexService.currentPokedex.caught['26']?.won).toBeTrue();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST-02: chooseWhoWillEvolve — 8 zero-evolvable branches
  // ══════════════════════════════════════════════════════════════════════════

  describe('chooseWhoWillEvolve — zero evolvable pokemon', () => {
    beforeEach(() => {
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([]);
      spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({ result: Promise.resolve() } as any));
    });

    it('gym-battle → buyPotions()', () => {
      spyOn(component, 'buyPotions');
      component.chooseWhoWillEvolve('gym-battle');
      expect(component.buyPotions).toHaveBeenCalled();
    });

    it('visit-daycare → mysteriousEgg()', () => {
      spyOn(component, 'mysteriousEgg');
      component.chooseWhoWillEvolve('visit-daycare');
      expect(component.mysteriousEgg).toHaveBeenCalled();
    });

    it('battle-rival → findItem()', () => {
      spyOn(component, 'findItem');
      component.chooseWhoWillEvolve('battle-rival');
      expect(component.findItem).toHaveBeenCalled();
    });

    it('battle-trainer → buyPotions()', () => {
      spyOn(component, 'buyPotions');
      component.chooseWhoWillEvolve('battle-trainer');
      expect(component.buyPotions).toHaveBeenCalled();
    });

    it('team-rocket-encounter → findItem()', () => {
      spyOn(component, 'findItem');
      component.chooseWhoWillEvolve('team-rocket-encounter');
      expect(component.findItem).toHaveBeenCalled();
    });

    it('snorlax-encounter → findItem()', () => {
      spyOn(component, 'findItem');
      component.chooseWhoWillEvolve('snorlax-encounter');
      expect(component.findItem).toHaveBeenCalled();
    });

    it('rare-candy → doNothing()', () => {
      spyOn(component, 'doNothing');
      component.chooseWhoWillEvolve('rare-candy');
      expect(component.doNothing).toHaveBeenCalled();
    });

    it('default (unknown eventSource) → doNothing()', () => {
      spyOn(component, 'doNothing');
      component.chooseWhoWillEvolve('explore-cave' as any);
      expect(component.doNothing).toHaveBeenCalled();
    });
  });

  describe('chooseWhoWillEvolve — single evolvable pokemon', () => {
    it('length === 1 → evolvePokemon called with the pokemon', () => {
      const caterpie: any = {
        pokemonId: 10, text: 'pokemon.caterpie', fillStyle: 'green',
        sprite: { front_default: 'c.png', front_shiny: 'cs.png' },
        shiny: false, power: 1, weight: 1,
      };
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([caterpie]);
      const evolveSpy = jasmine.createSpy('evolvePokemon');
      (component as any).evolvePokemon = evolveSpy;

      component.chooseWhoWillEvolve('gym-battle');

      expect(evolveSpy).toHaveBeenCalledWith(caterpie);
    });
  });

  describe('chooseWhoWillEvolve — multiple evolvable pokemon', () => {
    it('length > 1 → current state becomes select-from-pokemon-list', () => {
      const poke1: any = {
        pokemonId: 1, text: 'pokemon.bulbasaur', fillStyle: 'green',
        sprite: { front_default: 'b.png', front_shiny: 'bs.png' }, shiny: false, power: 2, weight: 1,
      };
      const poke2: any = {
        pokemonId: 10, text: 'pokemon.caterpie', fillStyle: 'lime',
        sprite: { front_default: 'c.png', front_shiny: 'cs.png' }, shiny: false, power: 1, weight: 1,
      };
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([poke1, poke2]);

      component.chooseWhoWillEvolve('gym-battle');

      // pushes 'evolve-pokemon' then 'select-from-pokemon-list', finishCurrentState() pops 'select-from-pokemon-list'
      expect(component.getGameState()).toBe('select-from-pokemon-list');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST-02: stealPokemon
  // ══════════════════════════════════════════════════════════════════════════

  describe('stealPokemon', () => {
    const makePokemon = (id: number): any => ({
      pokemonId: id, text: `pokemon.${id}`, fillStyle: 'green',
      sprite: { front_default: 'p.png', front_shiny: 'ps.png' },
      shiny: false, power: 1, weight: 1,
    });

    it('with team >= 2 and no escape-rope → transitions to select-from-pokemon-list', () => {
      trainerService.addToTeam(makePokemon(1));
      trainerService.addToTeam(makePokemon(4));

      component.stealPokemon();

      expect(component.getGameState()).toBe('select-from-pokemon-list');
    });

    it('with team >= 2 and no escape-rope → auxPokemonList contains both team members', () => {
      trainerService.addToTeam(makePokemon(1));
      trainerService.addToTeam(makePokemon(4));

      component.stealPokemon();

      expect((component as any).auxPokemonList.length).toBe(2);
    });

    it('with team < 2 → opens teamRocketFailsModal', () => {
      spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({ result: Promise.resolve() } as any));

      component.stealPokemon();

      expect(modalQueueService.open).toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST-02: tradePokemon
  // ══════════════════════════════════════════════════════════════════════════

  describe('tradePokemon', () => {
    const makePokemon = (id: number): any => ({
      pokemonId: id, text: `pokemon.${id}`, fillStyle: 'blue',
      sprite: { front_default: 'p.png', front_shiny: 'ps.png' },
      shiny: false, power: 1, weight: 1,
    });

    it('with single-member team → sets currentContextPokemon to that pokemon', () => {
      const bulbasaur = makePokemon(1);
      trainerService.addToTeam(bulbasaur);

      component.tradePokemon();

      expect((component as any).currentContextPokemon?.pokemonId).toBe(1);
    });

    it('with multi-member team → transitions to select-from-pokemon-list', () => {
      trainerService.addToTeam(makePokemon(1));
      trainerService.addToTeam(makePokemon(4));

      component.tradePokemon();

      expect(component.getGameState()).toBe('select-from-pokemon-list');
    });

    it('with multi-member team → auxPokemonList contains all team members', () => {
      trainerService.addToTeam(makePokemon(1));
      trainerService.addToTeam(makePokemon(4));

      component.tradePokemon();

      expect((component as any).auxPokemonList.length).toBe(2);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST-02: handleRareCandyEvolution
  // ══════════════════════════════════════════════════════════════════════════

  describe('handleRareCandyEvolution', () => {
    const RARE_CANDY: any = {
      name: 'rare-candy',
      text: 'items.rare-candy.name',
      fillStyle: 'pink',
      weight: 1,
      description: 'items.rare-candy.description',
      sprite: 'rare-candy.png',
    };

    it('calls chooseWhoWillEvolve("rare-candy") and removes item when there are evolvable pokemon', () => {
      const evolvablePokemon: any = {
        pokemonId: 10, text: 'pokemon.caterpie', fillStyle: 'green',
        sprite: { front_default: 'c.png', front_shiny: 'cs.png' }, shiny: false, power: 1, weight: 1,
      };
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([evolvablePokemon]);
      spyOn(trainerService, 'removeItem');
      spyOn(component, 'chooseWhoWillEvolve');

      component.handleRareCandyEvolution(RARE_CANDY);

      expect(component.chooseWhoWillEvolve).toHaveBeenCalledWith('rare-candy');
      expect(trainerService.removeItem).toHaveBeenCalledWith(RARE_CANDY);
    });

    it('does nothing when no pokemon can evolve', () => {
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([]);
      spyOn(component, 'chooseWhoWillEvolve');
      spyOn(trainerService, 'removeItem');

      component.handleRareCandyEvolution(RARE_CANDY);

      expect(component.chooseWhoWillEvolve).not.toHaveBeenCalled();
      expect(trainerService.removeItem).not.toHaveBeenCalled();
    });
  });
});
