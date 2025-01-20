import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private stateStack: GameState[] = []; // Stack for game states
  private state = new BehaviorSubject<GameState>('game-start');
  currentState = this.state.asObservable();

  constructor() {
    // Initialize the stack with game events (from end to start)
    this.initializeStates();
  }

  private initializeStates(): void {
    this.stateStack.push('champion-battle');
    this.stateStack.push('elite-four-battle-4');
    this.stateStack.push('elite-four-battle-3');
    this.stateStack.push('elite-four-battle-2');
    this.stateStack.push('elite-four-battle-1');
    this.stateStack.push('gym-battle-8');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-7');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-6');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-5');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-4');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-3');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-2');
    this.stateStack.push('adventure-continues');
    this.stateStack.push('gym-battle-1');
    this.stateStack.push('start-adventure');
    this.stateStack.push('starter-pokemon');
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
