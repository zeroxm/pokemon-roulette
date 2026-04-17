import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { EliteFourBattleRouletteComponent } from './elite-four-battle-roulette.component';
import { HttpClient } from '@angular/common/http';
import { GymLeader } from '../../../../interfaces/gym-leader';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { TypeMatchupService } from '../../../../services/type-matchup-service/type-matchup.service';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { ModalQueueService } from '../../../../services/modal-queue-service/modal-queue.service';
import { GameStateService } from '../../../../services/game-state-service/game-state.service';

describe('EliteFourBattleRouletteComponent', () => {
  let component: EliteFourBattleRouletteComponent;
  let fixture: ComponentFixture<EliteFourBattleRouletteComponent>;
  let trainerService: TrainerService;
  let typeMatchupService: TypeMatchupService;
  let modalQueueService: ModalQueueService;
  let gameStateService: GameStateService;

  const makeTestPokemon = (overrides: Partial<PokemonItem> = {}): PokemonItem => ({
    pokemonId: 4,
    text: 'pokemon.charmander',
    fillStyle: 'orange',
    sprite: { front_default: 'test.png', front_shiny: 'test-shiny.png' },
    shiny: false,
    power: 2,
    weight: 1,
    ...overrides,
  } as PokemonItem);

  const HYPER_POTION_ITEM: any = {
    name: 'hyper-potion',
    text: 'items.hyper-potion.name',
    fillStyle: 'blue',
    weight: 1,
    description: 'items.hyper-potion.description',
    sprite: 'hyper-potion.png',
  };

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
    httpSpyObj.get.and.returnValue(
      of({ sprites: { other: { 'official-artwork': { front_default: 'url', front_shiny: 'url' } } } })
    );

    await TestBed.configureTestingModule({
      imports: [EliteFourBattleRouletteComponent, TranslateModule.forRoot()],
      providers: [{ provide: HttpClient, useValue: httpSpyObj }],
    }).compileComponents();

    fixture = TestBed.createComponent(EliteFourBattleRouletteComponent);
    component = fixture.componentInstance;
    trainerService = TestBed.inject(TrainerService);
    typeMatchupService = TestBed.inject(TypeMatchupService);
    modalQueueService = TestBed.inject(ModalQueueService);
    gameStateService = TestBed.inject(GameStateService);

    gameStateService.resetGameState();
    trainerService.resetTeam();

    // Elite-four component requires currentElite and currentRound inputs
    component.currentElite = { name: 'Lorelei', sprite: '', quotes: ['...'] } as GymLeader;
    component.currentRound = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── calcVictoryOdds: Elite Four has 2 base-no slices ─────────────────────

  it('should produce 1 yes and 2 no slices with empty team at round 0', () => {
    component.currentElite = { name: 'Lorelei', sprite: '', quotes: [] } as GymLeader;
    component.currentRound = 0;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.elite.yes').length).toBe(1);
    // E4 starts harder: 0 round extras + 2 base = 2 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.elite.no').length).toBe(2);
  });

  it('should accumulate yes from team power and no from round progression', () => {
    trainerService.addToTeam(makeTestPokemon({ power: 3 }));
    component.currentElite = { name: 'Lorelei', sprite: '', quotes: [] } as GymLeader;
    component.currentRound = 1;
    (component as any).calcVictoryOdds();

    const odds: WheelItem[] = (component as any).victoryOdds;
    // base(1) + power(3) = 4 yes;  round(1) + base(2) = 3 no
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.elite.yes').length).toBe(4);
    expect(odds.filter((o: WheelItem) => o.text === 'game.main.roulette.elite.no').length).toBe(3);
  });

  // ── onItemSelected: hyper-potion gives 3 retries ─────────────────────────

  it('should reset retries to 3 and consume hyper-potion on exhausted spin', () => {
    spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({} as NgbModalRef));
    (component as any).trainerItems = [HYPER_POTION_ITEM];
    (component as any).victoryOdds = [
      { text: 'game.main.roulette.elite.no', fillStyle: 'crimson', weight: 1 },
    ];
    (component as any).retries = 1;
    spyOn(component.battleResultEvent, 'emit');

    component.onItemSelected(0);

    expect(component.battleResultEvent.emit).not.toHaveBeenCalledWith(false);
    expect((component as any).retries).toBe(3); // hyper-potion gives 3 retries
    expect((component as any).trainerItems.length).toBe(0);
  });

  // ── getCurrentElite: Gen 8 multi-elite handling ───────────────────────────

  it('should emit fromEliteChange for Gen 8 at a multi-elite round (round % 4 === 0)', (done) => {
    spyOn(modalQueueService, 'open').and.returnValue(Promise.resolve({} as NgbModalRef));

    (component as any).generation = { id: 8, text: 'Gen 8', region: 'Galar', fillStyle: 'purple', weight: 1 };
    component.currentRound = 0; // 0 % 4 === 0 → multi-elite path

    component.fromEliteChange.subscribe((index: number) => {
      expect(index).toBeGreaterThanOrEqual(0);
      done();
    });

    gameStateService.setNextState('elite-four-battle');
    gameStateService.finishCurrentState();
  });
});
