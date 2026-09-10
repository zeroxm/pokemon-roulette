import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme-service/theme.service';
import { AchievementService, AchievementUnlocks } from '../../services/achievement-service/achievement.service';
import {
  ACHIEVEMENTS,
  Achievement,
  AchievementGroup,
  Progress,
  achievementDescriptionKey,
  achievementNameKey,
} from '../../services/achievement-service/achievement-catalog';
import { StatsService } from '../../services/stats-service/stats.service';
import { PokedexService } from '../../services/pokedex-service/pokedex.service';
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
  imports: [CommonModule, NgIconsModule, TranslatePipe],
  templateUrl: './achievements.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './achievements.component.css',
})
export class AchievementsComponent implements OnInit, OnDestroy {

  constructor(
    private themeService: ThemeService,
    private modalService: NgbModal,
    private achievementService: AchievementService,
    private statsService: StatsService,
    private pokedexService: PokedexService,
    private badgeDexService: BadgeDexService,
  ) {}

  @ViewChild('achievementsModal', { static: true }) achievementsModal!: TemplateRef<unknown>;

  darkMode!: Observable<boolean>;

  readonly groups: readonly GroupedAchievements[] = this.groupAchievements();
  readonly total = ACHIEVEMENTS.length;

  progress: ReadonlyMap<string, Progress> = new Map();
  unlocks: AchievementUnlocks = {};
  totals: readonly LifetimeTotal[] = [];

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.themeService.isDark$;

    this.subscriptions.add(
      this.achievementService.progress$.subscribe(progress => (this.progress = progress)),
    );
    this.subscriptions.add(
      this.achievementService.unlocked$.subscribe(unlocks => (this.unlocks = unlocks)),
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

  openAchievements(): void {
    this.modalService.open(this.achievementsModal, { centered: true, size: 'lg', scrollable: true });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  private buildTotals(): LifetimeTotal[] {
    const caught = this.pokedexService.currentPokedex.caught;
    const entries = Object.values(caught);

    return [
      { labelKey: 'achievementsScreen.total.caught', value: entries.length },
      { labelKey: 'achievementsScreen.total.shiny', value: entries.filter(e => e.shiny).length },
      { labelKey: 'achievementsScreen.total.badges', value: this.badgeDexService.earned.size },
      { labelKey: 'achievementsScreen.total.runs', value: this.statsService.get('runs_completed') },
      { labelKey: 'achievementsScreen.total.spins', value: this.statsService.get('spins_total') },
    ];
  }

  private groupAchievements(): GroupedAchievements[] {
    const order: AchievementGroup[] = [
      'collection', 'shiny', 'champion', 'rival', 'forms', 'encounters', 'badges', 'grind',
    ];

    return order.map(group => ({
      group,
      achievements: ACHIEVEMENTS.filter(achievement => achievement.group === group),
    }));
  }
}
