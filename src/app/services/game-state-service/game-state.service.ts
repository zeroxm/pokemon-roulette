import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';
import { RunModifiers, initialRunModifiers } from './run-modifiers';

/**
 * Every generation currently runs the same league shape. If one ever differs, reintroduce a
 * per-generation lookup here rather than threading counts through call sites.
 */
const GYM_COUNT = 8;
const ELITE_FOUR_COUNT = 4;

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private stateStack: GameState[] = [];
  private state = new BehaviorSubject<GameState>('game-start');
  currentState = this.state.asObservable();

  private currentRound = new BehaviorSubject<number>(0);
  currentRoundObserver = this.currentRound.asObservable();

  private wheelSpinning = new BehaviorSubject<boolean>(false);
  wheelSpinningObserver = this.wheelSpinning.asObservable();

  /**
   * Run-scoped game rules. Mutated directly by the container; cleared wholesale by
   * `resetGameState()`, so no caller has to remember to reset them one by one.
   */
  readonly runModifiers: RunModifiers = initialRunModifiers();

  constructor() {
    this.initializeStates();
  }

  private initializeStates(): void {
    const stack: GameState[] = ['game-finish', 'champion-battle'];

    for (let i = 0; i < ELITE_FOUR_COUNT; i++) {
      stack.push('elite-four-battle');
    }

    stack.push('elite-four-preparation');

    for (let i = 0; i < GYM_COUNT; i++) {
      stack.push('gym-battle');
      if (i < GYM_COUNT - 1) {
        stack.push('adventure-continues');
      }
    }

    stack.push('start-adventure');
    stack.push('starter-pokemon');
    stack.push('character-select');

    this.stateStack = stack;
  }

  setNextState(newState: GameState): void {
    this.stateStack.push(newState);
  }

  /**
   * Queues several states in **play order**: `setNextStates('a', 'b')` runs `a`, then `b`.
   *
   * The stack pops last-in-first-out, so queuing by hand means pushing backwards. Doing that
   * at the call site reads wrong and is easy to get subtly out of order; this keeps the
   * reversal in one place.
   */
  setNextStates(...states: GameState[]): void {
    for (let i = states.length - 1; i >= 0; i--) {
      this.stateStack.push(states[i]);
    }
  }

  finishCurrentState(): GameState {
    if (this.stateStack.length > 0) {
      const poppedState = this.stateStack.pop();
      if (poppedState) {
        this.state.next(poppedState);
        return poppedState;
      }
    }
    return 'game-over';
  }

  advanceRound(): void {
    this.currentRound.next(this.currentRound.value + 1);
  }

  repeatCurrentState(): void {
    this.stateStack.push(this.state.value);
  }

  setWheelSpinning(state: boolean): void {
    this.wheelSpinning.next(state);
  }

  resetGameState(): void {
    Object.assign(this.runModifiers, initialRunModifiers());
    this.initializeStates();
    this.setNextState('game-start');
    this.finishCurrentState();
    this.currentRound.next(0);
  }
}
