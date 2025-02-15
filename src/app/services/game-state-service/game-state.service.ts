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
    ];
  }

  setNextState(newState: GameState): void {
    this.stateStack.push(newState);
  }

  finishCurrentState(): GameState {
    if (this.stateStack.length > 0) {
      const poppedState = this.stateStack.pop();
      if(poppedState) {
        this.state.next(poppedState);
        return poppedState;
      }
    }
    return 'game-over';
  }

  repeatCurrentState(): void {
    this.stateStack.push(this.state.value);
  }

  resetGameState(): void {
    this.initializeStates();
    this.setNextState('game-start');
    this.finishCurrentState();
  }
}
