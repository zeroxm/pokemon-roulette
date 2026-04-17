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
    service.setNextState('evolve-pokemon');         // pushed 2nd
    service.setNextState('select-from-pokemon-list'); // pushed 3rd — now on top

    const emitted: string[] = [];
    service.currentState.subscribe(state => emitted.push(state));

    // First pop: 'select-from-pokemon-list' (most recently pushed)
    service.finishCurrentState();
    // Second pop: 'evolve-pokemon'
    service.finishCurrentState();

    // emitted[0] is the BehaviorSubject's current value at subscribe time ('game-start')
    expect(emitted[1]).toBe('select-from-pokemon-list');
    expect(emitted[2]).toBe('evolve-pokemon');
  });
});
