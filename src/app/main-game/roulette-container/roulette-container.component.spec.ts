import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventSource } from '../EventSource';
import { CONSOLATION_PRIZES } from './consolation/consolation-prizes';
import { ItemModalComponent } from './modals/item-modal/item-modal.component';
import { provideTranslateService } from '@ngx-translate/core';
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
      imports: [RouletteContainerComponent],
      providers: [
        provideTranslateService(),
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
        })
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

    expect(component.currentGameState).toBe('select-form');
    expect(component.pokemonForms.map(form => form.pokemonId)).toEqual([386, 10001, 10002, 10003]);
    expect(trainerService.getTeam().length).toBe(0);
  });

  it('should capture immediately when pokemon has no forms', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    component.capturePokemon(bulbasaur!);

    expect(component.currentGameState).toBe('check-shininess');
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

  describe('champion win with a form still applied', () => {
    const CHARIZARD = 6;
    const MEGA_CHARIZARD_X = 10034;

    const giveStone = (name: string): void =>
      trainerService.addToItems({
        name, text: `items.${name}.name`, description: `items.${name}.description`,
        sprite: `${name}.png`, fillStyle: 'purple', weight: 1,
      } as any);

    it('records the win against the base Pokémon, not the mega form', () => {
      trainerService.addToTeam(pokemonService.getPokemonById(CHARIZARD)!);
      giveStone('charizardite-x');
      trainerService.forceMegaActivation(CHARIZARD, 'charizardite-x' as any);
      expect(trainerService.getTeam()[0].pokemonId)
        .withContext('the Pokémon must actually be mega-evolved when the champion falls')
        .toBe(MEGA_CHARIZARD_X);

      component.championBattleResult(true);

      // Mega forms are absent from `pokemonForms`, so getBasePokemonId cannot map 10034 back to 6.
      // The win is only correct because it is recorded after the state change reverts the form.
      expect(pokedexService.currentPokedex.caught[String(CHARIZARD)]?.won)
        .withContext('no golden box without this')
        .toBeTrue();
      expect(pokedexService.currentPokedex.caught[String(MEGA_CHARIZARD_X)]?.won)
        .withContext('the mega id has no Pokédex cell, so a win filed there is invisible')
        .toBeFalsy();
    });

    it('still records a win with nothing transformed', () => {
      trainerService.addToTeam(pokemonService.getPokemonById(CHARIZARD)!);

      component.championBattleResult(true);

      expect(pokedexService.currentPokedex.caught[String(CHARIZARD)]?.won).toBeTrue();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST-02: chooseWhoWillEvolve — 8 zero-evolvable branches
  // ══════════════════════════════════════════════════════════════════════════

  describe('restart clears run state', () => {
    it('wipes every run modifier', () => {
      const run = gameStateService.runModifiers;
      run.evolutionCredits = 5;
      run.expShareUsed = true;
      run.expSharePokemon = { pokemonId: 25 } as any;
      run.runningShoesUsed = true;
      run.stolenPokemon = { pokemonId: 143 } as any;

      gameStateService.resetGameState();

      expect(run.evolutionCredits).toBe(0);
      expect(run.expShareUsed).toBeFalse();
      expect(run.expSharePokemon).toBeNull();
      expect(run.runningShoesUsed).toBeFalse();
      expect(run.stolenPokemon).toBeNull();
    });

    it('wipes the container’s transient state when a new run starts', () => {
      component.auxPokemonList = [{ pokemonId: 1 } as any];
      component.auxItemList = [{ name: 'potion' } as any];
      component.customWheelTitle = 'stale.title';
      component.fromLeader = 3;
      (component as any).pendingPokemonSelection = { title: 't', options: [], onSelected: () => undefined };

      gameStateService.resetGameState();

      expect(component.auxPokemonList).toEqual([]);
      expect(component.auxItemList).toEqual([]);
      expect(component.customWheelTitle).toBe('');
      expect(component.fromLeader).toBe(0);
      expect((component as any).pendingPokemonSelection).toBeNull();
    });

    it('does not carry a pending selection into the next run', () => {
      let ranFromPreviousRun = false;
      (component as any).requestPokemonSelection({
        title: 'previous.run', options: [], onSelected: () => { ranFromPreviousRun = true; },
      });

      gameStateService.resetGameState();
      component.continueWithPokemon({ pokemonId: 1 } as any);

      expect(ranFromPreviousRun).toBeFalse();
    });
  });

  describe('exp-share bonus', () => {
    it('releases the bonus when nothing else can evolve', () => {
      const run = gameStateService.runModifiers;
      run.expShareUsed = true;
      run.expSharePokemon = { pokemonId: 25 } as any;
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([]);

      component.secondEvolution();

      expect(run.expShareUsed).toBeFalse();
      expect(run.expSharePokemon).toBeNull();
    });
  });

  describe('pending selections', () => {
    it('runs the continuation attached to the request, not a state-name lookup', () => {
      const chosen = { pokemonId: 1, text: 'a', fillStyle: 'red', weight: 1, shiny: false, power: 1, sprite: null } as any;
      let received: unknown = null;

      (component as any).requestPokemonSelection({
        title: 'some.title',
        options: [chosen],
        onSelected: (p: unknown) => { received = p; },
      });
      component.continueWithPokemon(chosen);

      expect(received).toBe(chosen);
    });

    it('exposes the request title and options to the wheel', () => {
      const options = [{ pokemonId: 7, text: 'b' } as any];

      (component as any).requestPokemonSelection({
        title: 'wheel.title', options, onSelected: () => undefined,
      });

      expect(component.customWheelTitle).toBe('wheel.title');
      expect(component.auxPokemonList).toBe(options);
    });

    it('consumes the request, so a stray selection cannot re-run it', () => {
      let calls = 0;
      const chosen = { pokemonId: 1 } as any;

      (component as any).requestPokemonSelection({
        title: 't', options: [chosen], onSelected: () => { calls++; },
      });
      component.continueWithPokemon(chosen);
      component.continueWithPokemon(chosen);

      expect(calls).toBe(1);
    });

    it('queues the mega stone wheel before advancing, so it is what renders next', () => {
      const setNextState = spyOn(gameStateService, 'setNextState').and.callThrough();
      const finish = spyOn(gameStateService, 'finishCurrentState').and.callThrough();
      const order: string[] = [];
      setNextState.and.callFake(() => { order.push('push'); });
      finish.and.callFake(() => { order.push('pop'); return 'game-over' as any; });

      (component as any).requestPokemonSelection({
        title: 't',
        options: [],
        onSelected: () => {
          (component as any).startMegaStoneAward({ pokemonId: 6 });
          (component as any).finishCurrentState();
        },
      });
      order.length = 0;
      component.continueWithPokemon({ pokemonId: 6 } as any);

      // Whatever the award pushed must be queued before the pop that reveals it.
      expect(order[order.length - 1]).toBe('pop');
    });
  });

  describe('chooseWhoWillEvolve — zero evolvable pokemon', () => {
    let openedModals: ItemModalComponent[];

    beforeEach(() => {
      openedModals = [];
      spyOn(trainerService, 'getPokemonThatCanEvolve').and.returnValue([]);
      spyOn(modalQueueService, 'open').and.callFake(() => {
        const componentInstance = {} as ItemModalComponent;
        openedModals.push(componentInstance);
        return Promise.resolve({ componentInstance, result: Promise.resolve() } as any);
      });
    });

    // Asserts the observable outcome — which prize the player actually sees and which
    // follow-up runs — rather than merely which method got called.
    // Expected keys are spelled out rather than read back from CONSOLATION_PRIZES — comparing the
    // table against itself would pass even if a row were wired to the wrong copy.
    const cases: Array<{
      source: EventSource;
      follow: 'buyPotions' | 'mysteriousEgg' | 'findItem';
      titleKey: string;
      sprite: 'potion.png' | 'unknown.png' | 'mystery-egg.png';
    }> = [
      { source: 'gym-battle',            follow: 'buyPotions',    titleKey: 'game.main.altPrizes.gymBattle.potion',       sprite: 'potion.png' },
      { source: 'elite-four-battle',     follow: 'buyPotions',    titleKey: 'game.main.altPrizes.eliteFourBattle.potion', sprite: 'potion.png' },
      { source: 'battle-trainer',        follow: 'buyPotions',    titleKey: 'game.main.altPrizes.battleTrainer.potion',   sprite: 'potion.png' },
      { source: 'visit-daycare',         follow: 'mysteriousEgg', titleKey: 'game.main.altPrizes.visitDaycare.egg',       sprite: 'mystery-egg.png' },
      { source: 'battle-rival',          follow: 'findItem',      titleKey: 'game.main.altPrizes.battleRival.item',       sprite: 'unknown.png' },
      { source: 'team-rocket-encounter', follow: 'findItem',      titleKey: 'game.main.altPrizes.teamRocket.item',        sprite: 'unknown.png' },
      { source: 'snorlax-encounter',     follow: 'findItem',      titleKey: 'game.main.altPrizes.snorlax.item',           sprite: 'unknown.png' }
    ];

    for (const { source, follow, titleKey, sprite } of cases) {
      it(`${source}: shows its own prize copy and runs ${follow}()`, async () => {
        spyOn(component, follow);

        component.chooseWhoWillEvolve(source);
        await Promise.resolve();

        expect(component[follow]).toHaveBeenCalled();
        expect(openedModals.length).toBe(1);
        expect(openedModals[0].titleKey).toBe(titleKey);
        expect(openedModals[0].descriptionKey).toBe(`${titleKey}Desc`);
        expect(openedModals[0].sprite).toContain(sprite);
      });
    }

    it('rare-candy does nothing and shows no prize', () => {
      spyOn(component, 'doNothing');
      component.chooseWhoWillEvolve('rare-candy');

      expect(component.doNothing).toHaveBeenCalled();
      expect(openedModals.length).toBe(0);
    });

    it('every EventSource has a prize row, and each row is fully populated', () => {
      const sources: EventSource[] = [
        'battle-trainer', 'gym-battle', 'elite-four-battle', 'visit-daycare',
        'team-rocket-encounter', 'snorlax-encounter', 'battle-rival', 'rare-candy'
      ];

      for (const source of sources) {
        const prize = CONSOLATION_PRIZES[source];
        expect(prize).withContext(source).toBeDefined();
        if (prize.action !== 'none') {
          expect(prize.titleKey).withContext(`${source} title`).toBeTruthy();
          expect(prize.descriptionKey).withContext(`${source} description`).toBeTruthy();
          expect(prize.sprite).withContext(`${source} sprite`).toMatch(/^https:\/\//);
        }
      }
    });

    it('falls back to doing nothing for an unmapped source', () => {
      spyOn(component, 'doNothing');
      component.chooseWhoWillEvolve('explore-cave' as unknown as EventSource);
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

      // queues a pokemon selection, then finishCurrentState() pops it so the wheel renders
      expect(component.currentGameState).toBe('select-from-pokemon-list');
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

      expect(component.currentGameState).toBe('select-from-pokemon-list');
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

      expect(component.currentGameState).toBe('select-from-pokemon-list');
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
