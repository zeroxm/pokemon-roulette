import { TestBed } from '@angular/core/testing';

import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
    // Reset to a clean, known state before every test.
    // After resetGameState():
    //   currentState observable just emitted 'game-start'
    //   stack top = 'character-select' (next to pop)
    service.resetGameState();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setNextStates', () => {
    it('runs the queued states in the order they are written', () => {
      service.setNextStates('go-fishing', 'find-fossil', 'explore-cave');

      expect(service.finishCurrentState()).toBe('go-fishing');
      expect(service.finishCurrentState()).toBe('find-fossil');
      expect(service.finishCurrentState()).toBe('explore-cave');
    });

    it('matches what pushing one at a time in reverse used to do', () => {
      service.setNextState('go-fishing');
      service.setNextState('select-from-pokemon-list');
      const byHand = [service.finishCurrentState(), service.finishCurrentState()];

      service.resetGameState();
      service.setNextStates('select-from-pokemon-list', 'go-fishing');
      const byHelper = [service.finishCurrentState(), service.finishCurrentState()];

      expect(byHelper).toEqual(byHand);
    });

    it('leaves the stack untouched when given nothing', () => {
      const before = service.finishCurrentState();
      service.resetGameState();
      service.setNextStates();

      expect(service.finishCurrentState()).toBe(before);
    });
  });

  // ── finishCurrentState: pops and emits ─────────────────────────────────

  it('should emit character-select after one finishCurrentState call from reset state', () => {
    let emitted: string | undefined;
    service.currentState.subscribe(state => (emitted = state));

    service.finishCurrentState();

    // 'character-select' is on top of the stack after resetGameState()
    expect(emitted).toBe('character-select');
  });

  it('should return the popped state from finishCurrentState', () => {
    service.setNextState('select-form');

    const result = service.finishCurrentState();

    expect(result).toBe('select-form');
  });

  // ── setNextState: inserts on top (LIFO) ────────────────────────────────

  it('should emit the most recently inserted state when finishCurrentState is called', () => {
    service.setNextState('check-evolution');

    let emitted: string | undefined;
    service.currentState.subscribe(state => (emitted = state));

    service.finishCurrentState();

    expect(emitted).toBe('check-evolution');
  });

  it('should pop states in LIFO order when multiple setNextState calls are made', () => {
    service.setNextState('go-fishing');         // pushed 2nd
    service.setNextState('select-from-pokemon-list'); // pushed 3rd — now on top

    const emitted: string[] = [];
    service.currentState.subscribe(state => emitted.push(state));

    // First pop: 'select-from-pokemon-list' (most recently pushed)
    service.finishCurrentState();
    // Second pop: 'go-fishing'
    service.finishCurrentState();

    // emitted[0] is the BehaviorSubject's current value at subscribe time ('game-start')
    expect(emitted[1]).toBe('select-from-pokemon-list');
    expect(emitted[2]).toBe('go-fishing');
  });
});
