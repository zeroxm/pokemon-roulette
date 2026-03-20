import { Injectable } from '@angular/core';
import { SettingsService } from '../settings-service/settings.service';
import { Observable, map } from 'rxjs';

export type SoundFxHandle = string;
type SoundFxEndedListener = () => void;
export interface PlaySoundFxOptions {
  preventOverlap?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SoundFxService {
  private audioContext: AudioContext | null = null;
  private readonly sourceByHandle = new Map<SoundFxHandle, string>();
  private readonly decodedBufferCache = new Map<string, Promise<AudioBuffer>>();
  private readonly activeSourcesByHandle = new Map<SoundFxHandle, Set<AudioBufferSourceNode>>();
  private readonly endedListenersByHandle = new Map<SoundFxHandle, Set<SoundFxEndedListener>>();
  private readonly pendingPlayCountByHandle = new Map<SoundFxHandle, number>();
  private handleCounter = 0;

  constructor(private settingsService: SettingsService) {}

  /**
   * Creates a handle for the item-found sound effect.
   */
  createItemFoundSoundFx(): SoundFxHandle {
    return this.createSoundFx('./ItemFound.mp3');
  }

  /**
   * Creates a handle for the wheel click sound effect.
   */
  createClickSoundFx(): SoundFxHandle {
    return this.createSoundFx('./click.mp3');
  }

  /**
   * Creates a handle for the PC boot sound effect.
   */
  createPcTurningOnSoundFx(): SoundFxHandle {
    return this.createSoundFx('./PCTurningOn.mp3');
  }

  /**
   * Creates a handle for the PC login sound effect.
   */
  createPcLoginSoundFx(): SoundFxHandle {
    return this.createSoundFx('./PCLogin.mp3');
  }

  /**
   * Creates a handle for the PC logout sound effect.
   */
  createPcLogoutSoundFx(): SoundFxHandle {
    return this.createSoundFx('./PCLogout.mp3');
  }

  /**
   * Internal generic creator so only this service owns asset paths.
   */
  private createSoundFx(src: string): SoundFxHandle {
    this.handleCounter += 1;
    const handle = `sound-fx-${this.handleCounter}`;
    this.sourceByHandle.set(handle, src);
    return handle;
  }

  /**
  * Plays sound effect audio for a given handle.
   * Returns false for blocked/failed play attempts without throwing.
   */
  async playSoundFx(handle: SoundFxHandle, volume: number = 1.0, options?: PlaySoundFxOptions): Promise<boolean> {
    const src = this.sourceByHandle.get(handle);
    if (!src) {
      return false;
    }

    if (options?.preventOverlap && this.isHandleBusy(handle)) {
      return false;
    }

    this.incrementPending(handle);

    try {
      const context = this.getOrCreateAudioContext();
      if (!context) {
        return false;
      }

      if (context.state !== 'running') {
        try {
          await context.resume();
        } catch {
          return false;
        }
      }

      if (context.state !== 'running') {
        return false;
      }

      let buffer: AudioBuffer;
      try {
        buffer = await this.getOrDecodeBuffer(src, context);
      } catch {
        return false;
      }

      const source = context.createBufferSource();
      const gain = context.createGain();

      source.buffer = buffer;
      source.connect(gain);
      gain.connect(context.destination);

      const clampedVolume = Math.max(0, Math.min(1, volume));
      // Mute policy is future-only: each new play reads current mute state.
      gain.gain.value = this.settingsService.currentSettings.muteAudio ? 0 : clampedVolume;

      this.trackActiveSource(handle, source);
      source.onended = () => {
        this.untrackActiveSource(handle, source);
        this.emitEnded(handle);
      };

      source.start(0);
      return true;
    } catch {
      return false;
    } finally {
      this.decrementPending(handle);
    }
  }

  /**
  * Stops currently playing sound effects.
   * If no handle is provided, all active audio sources are stopped.
   */
  stopSoundFx(handle?: SoundFxHandle): void {
    if (handle) {
      const sources = this.activeSourcesByHandle.get(handle);
      if (!sources) {
        return;
      }

      for (const source of sources) {
        this.stopSource(source);
      }
      return;
    }

    for (const sources of this.activeSourcesByHandle.values()) {
      for (const source of sources) {
        this.stopSource(source);
      }
    }
  }

  /**
   * Registers an ended callback for a sound effect handle.
   * Returns a function to unregister the callback.
   */
  onSoundFxEnded(handle: SoundFxHandle, listener: SoundFxEndedListener): () => void {
    const listeners = this.endedListenersByHandle.get(handle) ?? new Set<SoundFxEndedListener>();
    listeners.add(listener);
    this.endedListenersByHandle.set(handle, listeners);

    return () => {
      const currentListeners = this.endedListenersByHandle.get(handle);
      if (!currentListeners) {
        return;
      }

      currentListeners.delete(listener);
      if (currentListeners.size === 0) {
        this.endedListenersByHandle.delete(handle);
      }
    };
  }

  /**
  * Observable that emits true when sound effects are muted.
   */
  get isSoundFxMuted$(): Observable<boolean> {
    return this.settingsService.settings$.pipe(
      map(settings => settings.muteAudio)
    );
  }

  /**
  * Gets current sound effects mute state synchronously.
   */
  get isSoundFxMuted(): boolean {
    return this.settingsService.currentSettings.muteAudio;
  }

  private getOrCreateAudioContext(): AudioContext | null {
    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    this.audioContext = new AudioContextCtor();
    return this.audioContext;
  }

  private getOrDecodeBuffer(src: string, context: AudioContext): Promise<AudioBuffer> {
    const cached = this.decodedBufferCache.get(src);
    if (cached) {
      return cached;
    }

    const loadPromise = fetch(src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load audio asset: ${src}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .catch(error => {
        this.decodedBufferCache.delete(src);
        throw error;
      });

    this.decodedBufferCache.set(src, loadPromise);
    return loadPromise;
  }

  private trackActiveSource(handle: SoundFxHandle, source: AudioBufferSourceNode): void {
    const activeSources = this.activeSourcesByHandle.get(handle) ?? new Set<AudioBufferSourceNode>();
    activeSources.add(source);
    this.activeSourcesByHandle.set(handle, activeSources);
  }

  private isHandleBusy(handle: SoundFxHandle): boolean {
    const activeCount = this.activeSourcesByHandle.get(handle)?.size ?? 0;
    const pendingCount = this.pendingPlayCountByHandle.get(handle) ?? 0;
    return activeCount > 0 || pendingCount > 0;
  }

  private incrementPending(handle: SoundFxHandle): void {
    const currentCount = this.pendingPlayCountByHandle.get(handle) ?? 0;
    this.pendingPlayCountByHandle.set(handle, currentCount + 1);
  }

  private decrementPending(handle: SoundFxHandle): void {
    const currentCount = this.pendingPlayCountByHandle.get(handle) ?? 0;
    if (currentCount <= 1) {
      this.pendingPlayCountByHandle.delete(handle);
      return;
    }

    this.pendingPlayCountByHandle.set(handle, currentCount - 1);
  }

  private untrackActiveSource(handle: SoundFxHandle, source: AudioBufferSourceNode): void {
    const activeSources = this.activeSourcesByHandle.get(handle);
    if (!activeSources) {
      return;
    }

    activeSources.delete(source);
    if (activeSources.size === 0) {
      this.activeSourcesByHandle.delete(handle);
    }
  }

  private emitEnded(handle: SoundFxHandle): void {
    const listeners = this.endedListenersByHandle.get(handle);
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener();
    }
  }

  private stopSource(source: AudioBufferSourceNode): void {
    try {
      source.stop();
    } catch {
      // Source may already be stopped.
    }

    try {
      source.disconnect();
    } catch {
      // Ignore disconnection errors from already disconnected nodes.
    }
  }
}
