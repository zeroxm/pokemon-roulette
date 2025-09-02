import { Injectable } from '@angular/core';
import { SettingsService } from '../settings-service/settings.service';
import { Observable, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  
  constructor(private settingsService: SettingsService) {}

  /**
   * Plays an audio file with respect to mute settings
   * @param audio - The Audio object to play
   * @param volume - Volume level (0.0 to 1.0), will be set to 0 if muted
   */
  playAudio(audio: HTMLAudioElement, volume: number = 1.0): void {
    // Check if audio is muted
    const isMuted = this.settingsService.currentSettings.muteAudio;
    
    // Set volume to 0 if muted, otherwise use the provided volume
    audio.volume = isMuted ? 0 : volume;
    
    // Play the audio
    if (audio.paused) {
      audio.play();
    } else {
      audio.currentTime = 0;
      audio.play();
    }
  }

  /**
   * Creates a new Audio object with the specified source
   * @param src - Audio file path
   * @returns HTMLAudioElement
   */
  createAudio(src: string): HTMLAudioElement {
    return new Audio(src);
  }

  /**
   * Observable that emits true when audio is muted
   */
  get isMuted$(): Observable<boolean> {
    return this.settingsService.settings$.pipe(
      map(settings => settings.muteAudio)
    );
  }

  /**
   * Gets current mute state synchronously
   */
  get isMuted(): boolean {
    return this.settingsService.currentSettings.muteAudio;
  }
}
