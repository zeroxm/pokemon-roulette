import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  constructor() { }

  private state = new BehaviorSubject<GameState>('game-start');
  currentState = this.state.asObservable();

  setState(newState: GameState): void {
    this.state.next(newState);
  }

  getState(): GameState {
    return this.state.getValue();
  }
}
