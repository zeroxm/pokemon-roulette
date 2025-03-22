import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';

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
    this.stateStack = [
      'game-finish',
      'champion-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-preparation',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'adventure-continues',
      'gym-battle',
      'start-adventure',
      'starter-pokemon',
      'character-select'
    ];
  }

  setNextState(newState: GameState): void {
    this.stateStack.push(newState);
  }

  finishCurrentState(): GameState {

    if(['gym-battle', 'elite-four-battle', 'champion-battle'].includes(this.state.value)) {
      this.currentRound.next(this.currentRound.value + 1);
    }

    if (this.stateStack.length > 0) {
      const poppedState = this.stateStack.pop();
      if(poppedState) {
        if(poppedState === 'game-over') {
          this.currentRound.next(this.currentRound.value - 1);
        }
        this.state.next(poppedState);
        return poppedState;
      }
    }
    return 'game-over';
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
