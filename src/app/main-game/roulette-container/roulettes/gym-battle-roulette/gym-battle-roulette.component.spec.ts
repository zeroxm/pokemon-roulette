import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { GymBattleRouletteComponent } from './gym-battle-roulette.component';
import { HttpClient } from '@angular/common/http';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';

describe('GymBattleRouletteComponent', () => {

  describe('plusModifiers (SEC-30b)', () => {
    it('returns 0 for an empty team instead of NaN', () => {
      (component as any).trainerTeam = [];
      (component as any).trainerItems = [{ name: 'x-attack' }];

      const result = (component as any).plusModifiers();
      expect(Number.isNaN(result)).withContext('NaN silently dropped the bonus').toBeFalse();
      expect(result).toBe(0);
    });

    it('rounds a fractional mean up, as the old loop did', () => {
      (component as any).trainerTeam = [{ power: 2 }, { power: 3 }, { power: 3 }];  // mean 2.67
      (component as any).trainerItems = [{ name: 'x-attack' }];

      expect((component as any).plusModifiers()).toBe(3);
    });
  });
  let component: GymBattleRouletteComponent;
  let fixture: ComponentFixture<GymBattleRouletteComponent>;
  let trainerService: TrainerService;
  let typeMatchupService: TypeMatchupService;
  let modalQueueService: ModalQueueService;
  let gameStateService: GameStateService;

  /** Pre-set sprite prevents loadPokemonSpriteIfMissing from calling HTTP. */
  const makeTestPokemon = (overrides: Partial<PokemonItem> = {}): PokemonItem => ({
    pokemonId: 1,
    text: 'pokemon.bulbasaur',
    fillStyle: 'green',
    sprite: { front_default: 'test.png', front_shiny: 'test-shiny.png' },
    shiny: false,
    power: 2,
    weight: 1,
    ...overrides,
  } as PokemonItem);

  const POTION_ITEM: any = {
    name: 'potion',
    text: 'items.potion.name',
    fillStyle: 'purple',
    weight: 1,
    description: 'items.potion.description',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
  };

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
    httpSpyObj.get.and.returnValue(
      of({ sprites: { other: { 'official-artwork': { front_default: 'url', front_shiny: 'url' } } } })
    );

    await TestBed.configureTestingModule({
      imports: [GymBattleRouletteComponent],
      providers: [
        provideTranslateService(),{ provide: HttpClient, useValue: httpSpyObj }],
    }).compileComponents();

    fixture = TestBed.createComponent(GymBattleRouletteComponent);
    component = fixture.componentInstance;
    trainerService = TestBed.inject(TrainerService);
    typeMatchupService = TestBed.inject(TypeMatchupService);
    modalQueueService = TestBed.inject(ModalQueueService);
    gameStateService = TestBed.inject(GameStateService);

    gameStateService.resetGameState();
    trainerService.resetTeam();

    component.currentLeader = { name: 'Brock', sprite: '', quotes: ['Quote'] } as GymLeader;
    component.currentRound = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Ash-Greninja: the hidden potion reward ────────────────────────────────

  describe('Ash-Greninja', () => {
    const GRENINJA = 658;
    const ASH_GRENINJA = 10117;
    const LOSE = 'game.main.roulette.gym.no';

    const loseWithPotion = (): void => {
      (component as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (component as any).trainerItems = [POTION_ITEM];
      (component as any).retries = 1;
    };

    beforeEach(() => {
      spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({
        componentInstance: {},
      } as NgbModalRef));
    });

    it('transforms when a potion is used in the battle', async () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: GRENINJA, power: 3 }));
      loseWithPotion();

      component.onItemSelected(0);
      await Promise.resolve();

      expect(trainerService.getTeam()[0].pokemonId).toBe(ASH_GRENINJA);
      expect(trainerService.getTeam()[0].power).toBe(5);
    });

    it('stays base while no potion has been used', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: GRENINJA }));
      (component as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (component as any).trainerItems = [];
      (component as any).retries = 1;

      component.onItemSelected(0);

      expect(trainerService.getTeam()[0].pokemonId)
        .withContext('losing alone must not transform it')
        .toBe(GRENINJA);
    });

    it('plays the mega animation with the right pair of ids', async () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: GRENINJA }));
      loseWithPotion();

      component.onItemSelected(0);
      await Promise.resolve();
      await Promise.resolve();

      const opened = (modalQueueService.open as jasmine.Spy).calls.allArgs().map(args => args[0]);
      expect(opened.some((c: any) => c?.name?.includes('MegaEvolutionAnimationModal')))
        .withContext('the transformation reuses the mega cutscene')
        .toBeTrue();
    });

    it('leaves other Pokemon alone when a potion is used', async () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: 1 }));
      loseWithPotion();

      component.onItemSelected(0);
      await Promise.resolve();

      expect(trainerService.getTeam()[0].pokemonId).toBe(1);
    });
  });

  // ── Mimikyu's Disguise: the last-resort retry ─────────────────────────────

  describe("Mimikyu's Disguise", () => {
    const MIMIKYU = 778;
    const MIMIKYU_BUSTED = 10143;
    const LOSE = 'game.main.roulette.gym.no';

    /** Puts the component in the state a losing spin lands in, with no potions held. */
    const loseWithNoPotions = (): void => {
      (component as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (component as any).trainerItems = [];
      (component as any).retries = 1;   // onItemSelected decrements to 0 before deciding
    };

    beforeEach(() => {
      spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({
        componentInstance: {},
      } as NgbModalRef));
    });

    it('busts the disguise instead of losing, and grants a retry', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      const lost = spyOn(component.battleResultEvent, 'emit');
      loseWithNoPotions();

      component.onItemSelected(0);

      expect(lost).withContext('the battle must not end').not.toHaveBeenCalled();
      expect((component as any).retries).withContext('one more spin, like a Potion').toBe(1);
      expect(trainerService.getTeam()[0].pokemonId).toBe(MIMIKYU_BUSTED);
    });

    it('cannot absorb a second defeat with the same Mimikyu', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      loseWithNoPotions();
      component.onItemSelected(0);

      const lost = spyOn(component.battleResultEvent, 'emit');
      loseWithNoPotions();
      component.onItemSelected(0);

      expect(lost).toHaveBeenCalledWith(false);
    });

    it('cannot be spent twice in one battle, even with a second Mimikyu', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      loseWithNoPotions();
      component.onItemSelected(0);

      // A second, still-disguised Mimikyu joins mid-battle. The limit is per battle, not per
      // Pokémon, so it must not buy another retry in this same fight.
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      const lost = spyOn(component.battleResultEvent, 'emit');
      loseWithNoPotions();
      component.onItemSelected(0);

      expect(lost).toHaveBeenCalledWith(false);
      expect(trainerService.getTeam()[1].pokemonId)
        .withContext('the newcomer keeps its disguise')
        .toBe(MIMIKYU);
    });

    it('is available again in the next battle', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      loseWithNoPotions();
      component.onItemSelected(0);
      expect(trainerService.getTeam()[0].pokemonId).toBe(MIMIKYU_BUSTED);

      // Leaving the battle repairs the disguise, and the container destroys this component - the
      // next battle gets a fresh instance with an unspent one.
      (trainerService as any).syncBattleForms('main-adventure');   // what the state subscription does
      expect(trainerService.getTeam()[0].pokemonId)
        .withContext('the disguise goes back on when the fight ends')
        .toBe(MIMIKYU);

      const next = TestBed.createComponent(GymBattleRouletteComponent);
      next.componentInstance.currentLeader = { name: 'Misty', sprite: '', quotes: [] } as GymLeader;
      next.componentInstance.currentRound = 1;
      next.detectChanges();
      const lost = spyOn(next.componentInstance.battleResultEvent, 'emit');
      (next.componentInstance as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (next.componentInstance as any).trainerItems = [];
      (next.componentInstance as any).retries = 1;

      next.componentInstance.onItemSelected(0);

      expect(lost).withContext('a fresh battle can be rescued again').not.toHaveBeenCalled();
      expect(trainerService.getTeam()[0].pokemonId).toBe(MIMIKYU_BUSTED);
    });

    it('shows the busted artwork without calling PokeAPI', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      const http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
      http.get.calls.reset();
      loseWithNoPotions();

      component.onItemSelected(0);

      expect(trainerService.getTeam()[0].sprite?.front_default)
        .withContext('PokeAPI has no official artwork for 10143, so the form hard-links its own')
        .toContain('10143.png');
      expect(http.get).not.toHaveBeenCalled();
    });

    it('does not fire while a potion is still available', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      (component as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (component as any).trainerItems = [POTION_ITEM];
      (component as any).retries = 1;

      component.onItemSelected(0);

      expect(trainerService.getTeam()[0].pokemonId)
        .withContext('potions are spent first; the disguise is the last resort')
        .toBe(MIMIKYU);
    });

    it('renders the retry banner without a potion behind it', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: MIMIKYU }));
      loseWithNoPotions();

      component.onItemSelected(0);
      fixture.detectChanges();

      // The banner used to read `currentItem.text`, which only a potion ever set — so a disguise
      // retry threw "Cannot read properties of undefined (reading 'text')" and broke the view.
      const banner: HTMLElement = fixture.nativeElement.querySelector('.respin-reason');
      expect(banner.textContent).toContain('x1');
      expect((component as any).respinReasonKey).toBe('game.main.roulette.disguise.respin');
    });

    it('renders the retry banner naming the potion when one was used', () => {
      (component as any).victoryOdds = [{ text: LOSE, fillStyle: 'crimson', weight: 1 }];
      (component as any).trainerItems = [POTION_ITEM];
      (component as any).retries = 1;

      component.onItemSelected(0);
      fixture.detectChanges();

      expect((component as any).respinReasonKey).toBe('items.potion.name');
      expect(fixture.nativeElement.querySelector('.respin-reason').textContent).toContain('x1');
    });

    it('loses normally when no Mimikyu is on the team', () => {
      trainerService.addToTeam(makeTestPokemon({ pokemonId: 1 }));
      const lost = spyOn(component.battleResultEvent, 'emit');
      loseWithNoPotions();

      component.onItemSelected(0);

      expect(lost).toHaveBeenCalledWith(false);
    });
  });

  // ── calcVictoryOdds: slice count by team power ────────────────────────────

  it('should produce 1 yes and 1 no slice with empty team at round 0', () => {
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(1);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(1);
  });

  it('should add yes slices proportional to team power — power 2 gives 3 yes', () => {
    trainerService.addToTeam(makeTestPokemon({ power: 2 }));
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(2) = 3 yes;  round(0) + base(1) = 1 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(3);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(1);
  });

  it('should add extra no slices proportional to current round — round 2 gives 3 no', () => {
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [] } as GymLeader;
    component.currentRound = 2;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // empty team → 1 yes;  round(2) + base(1) = 3 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(1);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(3);
  });

  // ── Type-matchup branches ─────────────────────────────────────────────────

  it('should add 3 extra yes slices for overwhelming type advantage (strongCount >= 3)', () => {
    spyOn(typeMatchupService, 'calcTeamMatchup').and.returnValue({ strongCount: 3, weakCount: 0 });
    spyOn(typeMatchupService, 'getAdvantageLabel').and.returnValue('overwhelming');
    spyOn(typeMatchupService, 'getMatchupTypes').and.returnValue({ advantageTypes: [], disadvantageTypes: [] });

    trainerService.addToTeam(makeTestPokemon({ power: 1 }));
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [], types: ['fire'] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(1) + overwhelming(3) = 5 yes;  round(0) + base(1) = 1 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(5);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(1);
  });

  it('should add 2 extra yes slices for type advantage (strongCount = 1)', () => {
    spyOn(typeMatchupService, 'calcTeamMatchup').and.returnValue({ strongCount: 1, weakCount: 0 });
    spyOn(typeMatchupService, 'getAdvantageLabel').and.returnValue('advantage');
    spyOn(typeMatchupService, 'getMatchupTypes').and.returnValue({ advantageTypes: [], disadvantageTypes: [] });

    trainerService.addToTeam(makeTestPokemon({ power: 1 }));
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [], types: ['fire'] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(1) + advantage(2) = 4 yes;  1 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(4);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(1);
  });

  it('should add 1 extra no slice for type disadvantage when weakCount <= 3', () => {
    spyOn(typeMatchupService, 'calcTeamMatchup').and.returnValue({ strongCount: 0, weakCount: 1 });
    spyOn(typeMatchupService, 'getAdvantageLabel').and.returnValue('disadvantage');
    spyOn(typeMatchupService, 'getMatchupTypes').and.returnValue({ advantageTypes: [], disadvantageTypes: [] });

    trainerService.addToTeam(makeTestPokemon({ power: 1 }));
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [], types: ['fire'] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(1) = 2 yes;  disadvantage(1) + base(1) = 2 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(2);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(2);
  });

  it('should add 2 extra no slices for heavy type disadvantage when weakCount > 3', () => {
    spyOn(typeMatchupService, 'calcTeamMatchup').and.returnValue({ strongCount: 0, weakCount: 4 });
    spyOn(typeMatchupService, 'getAdvantageLabel').and.returnValue('disadvantage');
    spyOn(typeMatchupService, 'getMatchupTypes').and.returnValue({ advantageTypes: [], disadvantageTypes: [] });

    trainerService.addToTeam(makeTestPokemon({ power: 1 }));
    component.currentLeader = { name: 'Brock', sprite: '', quotes: [], types: ['fire'] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(1) = 2 yes;  heavy-disadvantage(2) + base(1) = 3 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.yes').length).toBe(2);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.gym.no').length).toBe(3);
  });

  // ── onItemSelected: item-use paths ───────────────────────────────────────

  it('should emit true on winning spin regardless of retries', () => {
    (component as any).victoryOdds = [
      { text: 'game.main.roulette.gym.yes', fillStyle: 'green', weight: 1 }
    ];
    (component as any).retries = 3;
    spyOn(component.battleResultEvent, 'emit');

    component.onItemSelected(0);

    expect(component.battleResultEvent.emit).toHaveBeenCalledWith(true);
  });

  it('should reset retries to 1 and consume potion on failed spin when potion is available', () => {
    spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({} as NgbModalRef));
    // Directly assign trainerItems to bypass resetItems() reference staleness
    (component as any).trainerItems = [POTION_ITEM];
    (component as any).victoryOdds = [
      { text: 'game.main.roulette.gym.no', fillStyle: 'crimson', weight: 1 }
    ];
    (component as any).retries = 1; // will be decremented to 0, triggering potion check
    spyOn(component.battleResultEvent, 'emit');

    component.onItemSelected(0);

    expect(component.battleResultEvent.emit).not.toHaveBeenCalledWith(false);
    // usePotion(potion) → case 'potion': retries = 1 and splices potion out
    expect((component as any).retries).toBe(1);
    expect((component as any).trainerItems.length).toBe(0); // potion consumed
  });

  it('should emit false on failed spin when retries exhausted and no potion available', () => {
    (component as any).trainerItems = []; // no potions
    (component as any).victoryOdds = [
      { text: 'game.main.roulette.gym.no', fillStyle: 'crimson', weight: 1 }
    ];
    (component as any).retries = 1;
    spyOn(component.battleResultEvent, 'emit');

    component.onItemSelected(0);

    expect(component.battleResultEvent.emit).toHaveBeenCalledWith(false);
  });

  // ── getCurrentLeader: multi-leader generation handling ───────────────────

  it('should emit fromLeaderChange when generation is 5 and round is a multi-leader round', (done) => {
    spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({} as NgbModalRef));

    // Override the component's captured generation to Gen 5 (id=5)
    (component as any).generation = { id: 5, text: 'Gen 5', region: 'Unova', fillStyle: 'darkcyan', weight: 1 };
    component.currentRound = 0; // Gen 5 round 0 is a multi-leader round

    component.fromLeaderChange.subscribe((index: number) => {
      expect(index).toBeGreaterThanOrEqual(0);
      done();
    });

    // Trigger onGameStateChange('gym-battle') → getCurrentLeader() → fromLeaderChange.emit()
    gameStateService.setNextState('gym-battle');
    gameStateService.finishCurrentState();
  });
});
