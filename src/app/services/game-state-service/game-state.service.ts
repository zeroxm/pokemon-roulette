import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private stateStack: GameState[] = []; // Stack for game states
  private state = new BehaviorSubject<GameState>('start-adventure');
  currentState = this.state.asObservable();

  constructor() {
    // Initialize the stack with game events (from end to start)
    this.initializeStates();
  }

  private initializeStates(): void {
    this.stateStack = [
      'champion-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
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
      // 'start-adventure',
      // 'starter-pokemon',
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
    return 'game-start';
  }
}
