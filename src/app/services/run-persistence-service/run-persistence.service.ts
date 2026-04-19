import { Injectable } from '@angular/core';
import { combineLatest, debounceTime, skip } from 'rxjs';
import { GameState } from '../game-state-service/game-state';
import { GameStateService } from '../game-state-service/game-state.service';
import { TrainerService } from '../trainer-service/trainer.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { ItemItem } from '../../interfaces/item-item';
import { Badge } from '../../interfaces/badge';

interface RunSave {
  version: 1;
  team: PokemonItem[];
  stored: PokemonItem[];
  items: ItemItem[];
  badges: Badge[];
  stateStack: GameState[];
  currentState: GameState;
  currentRound: number;
  gender: string;
}

@Injectable({ providedIn: 'root' })
export class RunPersistenceService {

  private readonly STORAGE_KEY = 'pokemon-roulette-run';
  private readonly NO_SAVE_STATES = new Set<GameState>(['game-start', 'game-over', 'game-finish']);

  constructor(
    private trainerService: TrainerService,
    private gameStateService: GameStateService,
  ) {
    this.loadRun();
    this.startAutoSave();
  }

  clearSave(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadRun(): void {
    const save = this.getSaveFromStorage();
    if (!save) return;

    this.trainerService.commitTeamAndStorage(save.team, save.stored);
    this.trainerService.restoreItems(save.items);
    this.trainerService.restoreBadges(save.badges);
    this.trainerService.gender = save.gender;
    this.gameStateService.restoreState(save.stateStack, save.currentState, save.currentRound);
  }

  private startAutoSave(): void {
    combineLatest([
      this.trainerService.getTeamObservable(),
      this.trainerService.getItemsObservable(),
      this.trainerService.getBadgesObservable(),
      this.gameStateService.currentState,
      this.gameStateService.currentRoundObserver,
    ]).pipe(
      skip(1),
      debounceTime(300),
    ).subscribe(([_team, items, badges, currentState, currentRound]) => {
      if (this.NO_SAVE_STATES.has(currentState)) return;
      this.saveRun(currentState, currentRound, items, badges);
    });
  }

  private saveRun(currentState: GameState, currentRound: number, items: ItemItem[], badges: Badge[]): void {
    const save: RunSave = {
      version: 1,
      team: this.trainerService.getTeam(),
      stored: this.trainerService.getStored(),
      items,
      badges,
      stateStack: this.gameStateService.getStateStack(),
      currentState,
      currentRound,
      gender: this.trainerService.gender,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(save));
  }

  private getSaveFromStorage(): RunSave | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as RunSave;
      if (parsed.version !== 1) return null;
      return parsed;
    } catch {
      console.error('Invalid run save in localStorage, discarding.');
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
