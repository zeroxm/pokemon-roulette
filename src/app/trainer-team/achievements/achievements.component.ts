import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme-service/theme.service';
import { AchievementService, AchievementUnlocks, CollectionCounts } from '../../services/achievement-service/achievement.service';
import {
  ACHIEVEMENTS,
  Achievement,
  AchievementGroup,
  Progress,
  achievementDescriptionKey,
  achievementNameKey,
} from '../../services/achievement-service/achievement-catalog';
import { StatsService } from '../../services/stats-service/stats.service';
import { BadgeDexService } from '../../services/badge-dex-service/badge-dex.service';

interface GroupedAchievements {
  readonly group: AchievementGroup;
  readonly achievements: readonly Achievement[];
}

/** One number a player might want to see about their whole history. */
interface LifetimeTotal {
  readonly labelKey: string;
  readonly value: number;
}

/**
 * The achievements screen: lifetime totals, then every achievement grouped.
 *
 * Progress comes from the same `progress()` function that decides unlocking, so
 * a bar and a tick can never disagree.
 */
@Component({
  selector: 'app-achievements',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './achievements.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './achievements.component.css',
})
export class AchievementsComponent implements OnInit, OnDestroy {

  constructor(
    private themeService: ThemeService,
    private achievementService: AchievementService,
    private statsService: StatsService,
    private badgeDexService: BadgeDexService,
  ) {}


  darkMode!: Observable<boolean>;

  readonly groups: readonly GroupedAchievements[] = this.groupAchievements();
  readonly total = ACHIEVEMENTS.length;

  progress: ReadonlyMap<string, Progress> = new Map();
  unlocks: AchievementUnlocks = {};
  totals: readonly LifetimeTotal[] = [];

  private collection: CollectionCounts = { species: 0, shinies: 0 };

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.themeService.isDark$;

    this.subscriptions.add(
      this.achievementService.progress$.subscribe(progress => (this.progress = progress)),
    );
    this.subscriptions.add(
      this.achievementService.unlocked$.subscribe(unlocks => (this.unlocks = unlocks)),
    );

    // Collection first, so the totals rebuilt below already see it: both come
    // from BehaviorSubjects and emit their current value on subscribe.
    this.subscriptions.add(
      this.achievementService.collection$.subscribe(collection => (this.collection = collection)),
    );
    // Totals are recomputed whenever anything they read changes.
    this.subscriptions.add(
      this.achievementService.progress$.subscribe(() => (this.totals = this.buildTotals())),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get unlockedCount(): number {
    return Object.keys(this.unlocks).length;
  }

  isUnlocked(achievement: Achievement): boolean {
    return achievement.id in this.unlocks;
  }

  nameKey(achievement: Achievement): string {
    return achievementNameKey(achievement.id);
  }

  descriptionKey(achievement: Achievement): string {
    return achievementDescriptionKey(achievement.id);
  }

  progressFor(achievement: Achievement): Progress {
    return this.progress.get(achievement.id) ?? { current: 0, target: 1 };
  }

  /** Capped at 100: a stored unlock can outlive the threshold that earned it. */
  percentFor(achievement: Achievement): number {
    const { current, target } = this.progressFor(achievement);
    if (target <= 0) {
      return 100;
    }
    return Math.min(100, Math.round((current / target) * 100));
  }

  groupLabelKey(group: AchievementGroup): string {
    return `achievementsScreen.group.${group}`;
  }



  private buildTotals(): LifetimeTotal[] {
    // From the service rather than counted here. This screen counted Pokédex
    // entries itself and so showed "4 Caught" beside achievements reading
    // "3/10" for the same collection -- alternate forms are entries but not
    // species, and only one of the two counts knew that.
    const collection = this.collection;

    return [
      { labelKey: 'achievementsScreen.total.caught', value: collection.species },
      { labelKey: 'achievementsScreen.total.shiny', value: collection.shinies },
      { labelKey: 'achievementsScreen.total.badges', value: this.badgeDexService.earned.size },
      { labelKey: 'achievementsScreen.total.runs', value: this.statsService.get('runs_won') },
      { labelKey: 'achievementsScreen.total.spins', value: this.statsService.get('spins_total') },
    ];
  }

  private groupAchievements(): GroupedAchievements[] {
    const order: AchievementGroup[] = [
      'collection', 'shiny', 'champion', 'rival', 'forms', 'encounters', 'badges', 'dedication',
    ];

    return order.map(group => ({
      group,
      achievements: ACHIEVEMENTS.filter(achievement => achievement.group === group),
    }));
  }
}
