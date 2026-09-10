import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { SyncStateService } from '../sync-state-service/sync-state.service';

export interface GameSettings {
  muteAudio: boolean;
  skipShinyRolls: boolean;
  skipMegaEvolutionAnimation: boolean;
  lessExplanations: boolean;
  defaultGender: 'male' | 'female' | 'always-choose';
}

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  private readonly STORAGE_KEY = 'pokemon-roulette-settings';
  private readonly defaultSettings: GameSettings = {
    muteAudio: false,
    skipShinyRolls: false,
    skipMegaEvolutionAnimation: false,
    lessExplanations: false,
    defaultGender: 'always-choose'
  };

  private settingsSubject$: BehaviorSubject<GameSettings>;

  constructor(private syncState: SyncStateService) {
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

  toggleSkipMegaEvolutionAnimation(): void {
    const currentSettings = this.currentSettings;
    const newSettings = {
      ...currentSettings,
      skipMegaEvolutionAnimation: !currentSettings.skipMegaEvolutionAnimation
    };
    this.updateSettings(newSettings);
  }

  toggleLessExplanations(): void {
    const currentSettings = this.currentSettings;
    const newSettings = { ...currentSettings, lessExplanations: !currentSettings.lessExplanations };
    this.updateSettings(newSettings);
  }

  setDefaultGender(gender: 'male' | 'female' | 'always-choose'): void {
    const currentSettings = this.currentSettings;
    const newSettings = { ...currentSettings, defaultGender: gender };
    this.updateSettings(newSettings);
  }

  resetSettings(): void {
    this.updateSettings(this.defaultSettings);
  }

  /**
   * Replaces settings with merged state. See PokedexService.adopt.
   *
   * Settings are the one last-write-wins collection, so unlike the others this
   * can overwrite a local value — with the server's, which by definition
   * reached it later.
   */
  adopt(settings: Partial<GameSettings>): void {
    const validated = this.validate(settings);
    this.saveSettingsToStorage(validated);
    this.settingsSubject$.next(validated);
  }

  private updateSettings(newSettings: GameSettings): void {
    this.saveSettingsToStorage(newSettings);
    this.syncState.markDirty();
    this.settingsSubject$.next(newSettings);
  }

  /**
   * Merges stored settings over the defaults, keeping only fields of the expected type.
   *
   * A plain spread accepted whatever JSON.parse produced, so `{"muteAudio": null}` or a
   * `defaultGender` of "banana" flowed straight into the app. A blob written by an older build is
   * a normal occurrence, so anything unrecognised falls back to the default.
   *
   * Written out field by field on purpose: adding a setting then fails to compile until its
   * validation is decided, which a loop would have silently skipped.
   */
  private getInitialSettings(): GameSettings {
    return this.validate(this.getSettingsFromStorage() ?? {});
  }

  private validate(stored: Partial<GameSettings>): GameSettings {
    const defaults = this.defaultSettings;
    const bool = (value: unknown, fallback: boolean): boolean =>
      typeof value === 'boolean' ? value : fallback;

    const genders: GameSettings['defaultGender'][] = ['male', 'female', 'always-choose'];
    const gender = genders.find(option => option === stored.defaultGender) ?? defaults.defaultGender;

    return {
      muteAudio: bool(stored.muteAudio, defaults.muteAudio),
      skipShinyRolls: bool(stored.skipShinyRolls, defaults.skipShinyRolls),
      skipMegaEvolutionAnimation: bool(stored.skipMegaEvolutionAnimation, defaults.skipMegaEvolutionAnimation),
      lessExplanations: bool(stored.lessExplanations, defaults.lessExplanations),
      defaultGender: gender,
    };
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
