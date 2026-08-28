import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';

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
    this.initializeStates();
    this.setNextState('game-start');
    this.finishCurrentState();
    this.currentRound.next(0);
  }
}
