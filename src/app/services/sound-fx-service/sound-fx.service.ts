import { Injectable } from '@angular/core';
import { SettingsService } from '../settings-service/settings.service';
import { Observable, map } from 'rxjs';

/**
 * The sounds the game can play.
 *
 * Callers used to mint an opaque handle per component, which meant two components asking for the
 * same asset got two different identities: `preventOverlap` was scoped to the *caller* rather than
 * the sound, so two components could talk over each other, and the handle map grew without bound
 * because every wheel instantiation added one and nothing removed it.
 */
export type SoundFxName =
  | 'click'
  | 'item-found'
  | 'pc-turning-on'
  | 'pc-login'
  | 'pc-logout'
  | 'mega-stone-tap'
  | 'mega-evolution';

const SOUND_FX_SRC: Record<SoundFxName, string> = {
  'click': './click.mp3',
  'item-found': './ItemFound.mp3',
  'pc-turning-on': './PCTurningOn.mp3',
  'pc-login': './PCLogin.mp3',
  'pc-logout': './PCLogout.mp3',
  'mega-stone-tap': './Mega_Stone_tap.mp3',
  'mega-evolution': './Mega_Evolution.mp3',
};

/** How long to wait for an `onended` that a suspended AudioContext may never deliver. */
const ENDED_TIMEOUT_MS = 10_000;

type SoundFxEndedListener = () => void;

export interface PlaySoundFxOptions {
  preventOverlap?: boolean;
}

export interface QueuedSoundFxItem {
  name: SoundFxName;
  volume?: number;
  options?: PlaySoundFxOptions;
}

/** Everything the service tracks about one sound, in one place. */
class SoundFxClip {
  readonly active = new Set<AudioBufferSourceNode>();
  readonly endedListeners = new Set<SoundFxEndedListener>();
  buffer?: Promise<AudioBuffer>;
  pending = 0;

  constructor(readonly src: string) {}

  get busy(): boolean {
    return this.active.size > 0 || this.pending > 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SoundFxService {
  private audioContext: AudioContext | null = null;
  private readonly clips = new Map<SoundFxName, SoundFxClip>();

  constructor(private settingsService: SettingsService) {}

  /**
   * Plays a sound. Returns false for blocked or failed attempts rather than throwing.
   */
  async playSoundFx(name: SoundFxName, volume: number = 1.0, options?: PlaySoundFxOptions): Promise<boolean> {
    const clip = this.clip(name);

    if (options?.preventOverlap && clip.busy) {
      return false;
    }

    clip.pending += 1;

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
        buffer = await this.getOrDecodeBuffer(clip, context);
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

      clip.active.add(source);
      source.onended = () => {
        clip.active.delete(source);
        this.emitEnded(clip);
      };

      source.start(0);
      return true;
    } catch {
      return false;
    } finally {
      clip.pending = Math.max(0, clip.pending - 1);
    }
  }

  /**
   * Plays sounds one after another, each waiting on the previous one's `ended` event.
   *
   * The wait is bounded: a backgrounded tab can suspend the AudioContext so `onended` never
   * fires, which would otherwise stall the queue — and with it whatever game flow is awaiting it —
   * indefinitely.
   */
  async playSoundFxQueue(items: QueuedSoundFxItem[]): Promise<void> {
    for (const item of items) {
      const pendingEnded = this.waitForSoundFxEnded(item.name);
      const started = await this.playSoundFx(item.name, item.volume ?? 1.0, item.options);

      if (!started) {
        pendingEnded.dispose();
        continue;
      }

      await pendingEnded.promise;
    }
  }

  /** Stops one sound, or every sound when no name is given. */
  stopSoundFx(name?: SoundFxName): void {
    const clips = name ? [this.clips.get(name)] : [...this.clips.values()];

    for (const clip of clips) {
      if (!clip) {
        continue;
      }
      for (const source of clip.active) {
        this.stopSource(source);
      }
    }
  }

  /** Registers an ended callback. Returns a function that unregisters it. */
  onSoundFxEnded(name: SoundFxName, listener: SoundFxEndedListener): () => void {
    const clip = this.clip(name);
    clip.endedListeners.add(listener);
    return () => clip.endedListeners.delete(listener);
  }

  /** Emits true when sound effects are muted. */
  get isSoundFxMuted$(): Observable<boolean> {
    return this.settingsService.settings$.pipe(
      map(settings => settings.muteAudio)
    );
  }

  /** Current mute state, read synchronously. */
  get isSoundFxMuted(): boolean {
    return this.settingsService.currentSettings.muteAudio;
  }

  private clip(name: SoundFxName): SoundFxClip {
    let clip = this.clips.get(name);
    if (!clip) {
      clip = new SoundFxClip(SOUND_FX_SRC[name]);
      this.clips.set(name, clip);
    }
    return clip;
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

  private getOrDecodeBuffer(clip: SoundFxClip, context: AudioContext): Promise<AudioBuffer> {
    if (clip.buffer) {
      return clip.buffer;
    }

    clip.buffer = fetch(clip.src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load audio asset: ${clip.src}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .catch(error => {
        clip.buffer = undefined;
        throw error;
      });

    return clip.buffer;
  }

  private emitEnded(clip: SoundFxClip): void {
    for (const listener of clip.endedListeners) {
      listener();
    }
  }

  private waitForSoundFxEnded(name: SoundFxName): { promise: Promise<void>; dispose: () => void } {
    let settled = false;
    let unregister = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (resolve: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      unregister();
      resolve();
    };

    const promise = new Promise<void>((resolve) => {
      unregister = this.onSoundFxEnded(name, () => finish(resolve));
      timer = setTimeout(() => finish(resolve), ENDED_TIMEOUT_MS);
    });

    const dispose = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      unregister();
    };

    return { promise, dispose };
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
