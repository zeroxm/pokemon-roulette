import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Whether local progress has reached the player's account.
 *
 * Owned by its own service because three collections are synced, counters,
 * badges and achievement unlocks, and a flag living inside one of them would
 * quietly report "saved" while another had unsaved changes.
 *
 * It matters because **signing out clears local data**. This is what lets the
 * UI warn before discarding progress that was never saved to an account.
 */
@Injectable({ providedIn: 'root' })
export class SyncStateService {
  private readonly STORAGE_KEY = 'pokemon-roulette-synced';

  private syncedSubject$: BehaviorSubject<boolean>;

  constructor() {
    this.syncedSubject$ = new BehaviorSubject(localStorage.getItem(this.STORAGE_KEY) === 'true');
  }

  get synced$(): Observable<boolean> {
    return this.syncedSubject$.asObservable();
  }

  get isSynced(): boolean {
    return this.syncedSubject$.getValue();
  }

  /** Called by anything that changes synced state. */
  markDirty(): void {
    this.set(false);
  }

  /** Called by the sync client after a successful push. */
  markSynced(): void {
    this.set(true);
  }

  private set(synced: boolean): void {
    if (this.isSynced === synced) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, String(synced));
    } catch (error) {
      console.error('Failed to record sync state:', error);
    }

    this.syncedSubject$.next(synced);
  }
}
