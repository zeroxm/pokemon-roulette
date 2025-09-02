import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export interface GameSettings {
  muteAudio: boolean;
  skipShinyRolls: boolean;
  lessExplanations: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  private readonly STORAGE_KEY = 'pokemon-roulette-settings';
  private readonly defaultSettings: GameSettings = {
    muteAudio: false,
    skipShinyRolls: false,
    lessExplanations: false
  };

  private settingsSubject$: BehaviorSubject<GameSettings>;

  constructor() {
    this.settingsSubject$ = new BehaviorSubject(this.getInitialSettings());
  }

  get settings$(): Observable<GameSettings> {
    return this.settingsSubject$.asObservable().pipe(distinctUntilChanged());
  }

  get currentSettings(): GameSettings {
    return this.settingsSubject$.getValue();
  }

  toggleMuteAudio(): void {
    const currentSettings = this.currentSettings;
    const newSettings = { ...currentSettings, muteAudio: !currentSettings.muteAudio };
    this.updateSettings(newSettings);
  }

  toggleSkipShinyRolls(): void {
    const currentSettings = this.currentSettings;
    const newSettings = { ...currentSettings, skipShinyRolls: !currentSettings.skipShinyRolls };
    this.updateSettings(newSettings);
  }

  toggleLessExplanations(): void {
    const currentSettings = this.currentSettings;
    const newSettings = { ...currentSettings, lessExplanations: !currentSettings.lessExplanations };
    this.updateSettings(newSettings);
  }

  resetSettings(): void {
    this.updateSettings(this.defaultSettings);
  }

  private updateSettings(newSettings: GameSettings): void {
    this.saveSettingsToStorage(newSettings);
    this.settingsSubject$.next(newSettings);
  }

  private getInitialSettings(): GameSettings {
    const settingsFromStorage = this.getSettingsFromStorage();
    return { ...this.defaultSettings, ...settingsFromStorage };
  }

  private saveSettingsToStorage(settings: GameSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  private getSettingsFromStorage(): Partial<GameSettings> | null {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);

    if (storageItem) {
      try {
        return JSON.parse(storageItem);
      } catch (error) {
        console.error(
          'Invalid settings localStorage item:',
          storageItem,
          'falling back to default settings'
        );
      }
    }

    return null;
  }
}
