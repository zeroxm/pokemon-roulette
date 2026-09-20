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
  /** Set while a `repeatCurrentState` is outstanding: the player is coming back to this one. */
  private resuming: GameState | null = null;
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

  /**
   * Pops the next state and emits it.
   *
   * An empty stack emits 'game-over' rather than only returning it, so the return value and what is
   * on screen always agree.
   */
  finishCurrentState(): GameState {
    const poppedState = this.stateStack.pop();
    const nextState = poppedState ?? 'game-over';

    // Arriving back at the repeated state ends the resumption.
    if (this.resuming !== null && nextState === this.resuming) {
      this.resuming = null;
    }

    this.state.next(nextState);
    return nextState;
  }

  /**
   * The state a `repeatCurrentState` is waiting to come back to, or null.
   *
   * Exists so a listener can tell a battle that has *ended* from one the player is mid-way
   * through. Peeking at the stack is not enough: the Elite Four queues four battles that all
   * carry the same name, so "the next state matches the one I just left" is true both for a
   * genuine detour and for simply moving on to the next fight.
   */
  get resumingState(): GameState | null {
    return this.resuming;
  }

  advanceRound(): void {
    this.currentRound.next(this.currentRound.value + 1);
  }

  repeatCurrentState(): void {
    this.resuming = this.state.value;
    this.stateStack.push(this.state.value);
  }

  setWheelSpinning(state: boolean): void {
    this.wheelSpinning.next(state);
  }

  resetGameState(): void {
    this.resuming = null;
    Object.assign(this.runModifiers, initialRunModifiers());
    this.initializeStates();
    this.setNextState('game-start');
    this.finishCurrentState();
    this.currentRound.next(0);
  }
}
