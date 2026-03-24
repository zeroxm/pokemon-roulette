import { Injectable } from '@angular/core';
import { GameState } from './game-state';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings-service/settings.service';

interface GameStateSave {
  stateStack: GameState[];
  currentRound: number;
  currentState: GameState;
  isRematch: boolean;
  rivalLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private readonly SAVE_KEY = 'pokemon-roulette-save';

  private stateStack: GameState[] = [];
  private state = new BehaviorSubject<GameState>('game-start');
  currentState = this.state.asObservable();

  private currentRound = new BehaviorSubject<number>(0);
  currentRoundObserver = this.currentRound.asObservable();

  private wheelSpinning = new BehaviorSubject<boolean>(false);
  wheelSpinningObserver = this.wheelSpinning.asObservable();

  private rivalLevel = new BehaviorSubject<number>(0);
  rivalLevelObserver = this.rivalLevel.asObservable();

  private _isRematch = new BehaviorSubject<boolean>(false);
  isRematch$ = this._isRematch.asObservable();

  constructor(private settingsService: SettingsService) {
    this.initializeStates();
  }

  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  loadFromSave(): boolean {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return false;
    try {
      const save: GameStateSave = JSON.parse(raw);
      this.stateStack = save.stateStack;
      this.currentRound.next(save.currentRound);
      this.state.next(save.currentState);
      this._isRematch.next(save.isRematch ?? false);
      this.rivalLevel.next(save.rivalLevel ?? 0);
      return true;
    } catch {
      this.clearSave();
      return false;
    }
  }

  clearSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  private saveToStorage(): void {
    const save: GameStateSave = {
      stateStack: this.stateStack,
      currentRound: this.currentRound.value,
      currentState: this.state.value,
      isRematch: this._isRematch.value,
      rivalLevel: this.rivalLevel.value
    };
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(save));
  }

  initializeStates(): void {
    const difficulty = this.settingsService.currentSettings.difficulty;

    const gymBlocks: GameState[] = [];
    const gymCount = difficulty === 'easy' ? 4 : 8;

    for (let i = 0; i < gymCount; i++) {
      if (i === 0) {
        gymBlocks.push('gym-battle', 'start-adventure');
      } else {
        gymBlocks.push('gym-battle', 'adventure-continues');
      }
    }

    const eliteFourBlock: GameState[] = [
      'champion-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-preparation',
    ];

    if (difficulty === 'hard') {
      eliteFourBlock.push('battle-rival');
    }

    this.stateStack = [
      'game-finish',
      ...eliteFourBlock,
      ...gymBlocks,
      'starter-pokemon',
      'character-select'
    ];
  }

  initializeRematchStates(): void {
    this._isRematch.next(true);
    this.currentRound.next(0);
    this.rivalLevel.next(0);

    const gymBlocks: GameState[] = [];
    for (let i = 0; i < 8; i++) {
      gymBlocks.push('gym-battle', 'adventure-continues');
    }

    this.stateStack = [
      'game-finish',
      'champion-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-battle',
      'elite-four-preparation',
      'battle-rival',
      ...gymBlocks,
    ];

    this.setNextState('adventure-continues');
    this.finishCurrentState();
  }

  setNextState(newState: GameState): void {
    this.stateStack.push(newState);
    this.saveToStorage();
  }

  finishCurrentState(): GameState {
    if (this.stateStack.length > 0) {
      const poppedState = this.stateStack.pop();
      if (poppedState) {
        this.state.next(poppedState);
        this.saveToStorage();
        return poppedState;
      }
    }
    return 'game-over';
  }

  advanceRound(): void {
    this.currentRound.next(this.currentRound.value + 1);
    this.saveToStorage();
  }

  retreatRound(): void {
    this.currentRound.next(this.currentRound.value - 1);
    this.saveToStorage();
  }

  repeatCurrentState(): void {
    this.stateStack.push(this.state.value);
    this.saveToStorage();
  }

  setWheelSpinning(state: boolean): void {
    this.wheelSpinning.next(state);
  }

  incrementRivalLevel(): void {
    this.rivalLevel.next(this.rivalLevel.value + 1);
    this.saveToStorage();
  }

  getRivalLevel(): number {
    return this.rivalLevel.value;
  }

  resetGameState(): void {
    this._isRematch.next(false);
    this.rivalLevel.next(0);
    this.initializeStates();
    this.setNextState('game-start');
    this.finishCurrentState();
    this.currentRound.next(0);
    this.clearSave();
  }
}
