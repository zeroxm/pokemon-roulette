import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { AchievementService } from '../../services/achievement-service/achievement.service';
import { Achievement, achievementNameKey } from '../../services/achievement-service/achievement-catalog';
import { SoundFxService } from '../../services/sound-fx-service/sound-fx.service';
import { SettingsService } from '../../services/settings-service/settings.service';

/** How long one achievement stays on screen when nothing is waiting behind it. */
const SOLO_DURATION_MS = 4500;

/** Shorter when several unlocked at once, so a run of them does not drag. */
const QUEUED_DURATION_MS = 2500;

/** Shorter again for players who asked for less hand-holding. */
const TERSE_DURATION_MS = 2000;

/**
 * Announces an achievement the moment it is earned.
 *
 * Deliberately **not** a modal. It fires mid-run, usually right after a catch
 * or a gym win when result modals are already queued, and a modal here would
 * stomp one of those — which is the exact problem ModalQueueService exists to
 * prevent. It is also `pointer-events: none`, because a banner that swallows a
 * click over the wheel would stop the player spinning.
 *
 * Several achievements can unlock from one event. They are queued rather than
 * stacked: three overlapping toasts is worse than three short ones.
 */
@Component({
  selector: 'app-achievement-toast',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './achievement-toast.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './achievement-toast.component.css',
})
export class AchievementToastComponent implements OnInit, OnDestroy {

  constructor(
    private achievementService: AchievementService,
    private soundFxService: SoundFxService,
    private settingsService: SettingsService,
  ) {}

  current: Achievement | null = null;

  private readonly pending: Achievement[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.achievementService.newlyUnlocked$.subscribe(batch => {
      if (batch.length === 0) {
        return;
      }

      this.pending.push(...batch);

      // One sound per batch, not per achievement. SoundFxService honours the
      // mute setting itself, so there is nothing to check here.
      this.soundFxService.playSoundFx('item-found');

      if (!this.current) {
        this.showNext();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearTimer();
  }

  nameKey(achievement: Achievement): string {
    return achievementNameKey(achievement.id);
  }

  /** Dismiss on click. The banner itself ignores pointers; the card does not. */
  dismiss(): void {
    this.clearTimer();
    this.showNext();
  }

  private showNext(): void {
    this.current = this.pending.shift() ?? null;

    if (!this.current) {
      return;
    }

    this.timer = setTimeout(() => this.showNext(), this.duration());
  }

  private duration(): number {
    if (this.settingsService.currentSettings.lessExplanations) {
      return TERSE_DURATION_MS;
    }
    return this.pending.length > 0 ? QUEUED_DURATION_MS : SOLO_DURATION_MS;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
