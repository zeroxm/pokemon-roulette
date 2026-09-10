import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme-service/theme.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { BadgeDexService, ALL_BADGE_IDS, badgeId } from '../../services/badge-dex-service/badge-dex.service';
import { badgesByGeneration } from '../../services/badges-service/badges-data';
import { Badge } from '../../interfaces/badge';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

/** One gym's worth of badges. More than one when the region offers a choice. */
interface BadgeRound {
  readonly badges: readonly Badge[];
}

interface RegionCase {
  readonly generationId: number;
  readonly region: string;
  readonly rounds: readonly BadgeRound[];
}

/**
 * The lifetime badge collection — a trophy case, not a Pokédex.
 *
 * Grouped by region and by gym rather than laid out as a flat grid: 77 badges
 * across nine regions have real structure, and "which gyms have I beaten in
 * Kanto" is the question someone actually has.
 */
@Component({
  selector: 'app-badge-dex',
  imports: [CommonModule, NgbTooltipModule, TranslatePipe, ImageFallbackDirective],
  templateUrl: './badge-dex.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './badge-dex.component.css',
})
export class BadgeDexComponent implements OnInit, OnDestroy {

  constructor(
    private themeService: ThemeService,
    private badgeDexService: BadgeDexService,
    private generationService: GenerationService,
  ) {}


  darkMode!: Observable<boolean>;
  earned: ReadonlySet<string> = new Set();
  currentGenerationId = 1;

  /**
   * Built in ngOnInit, not as a field initialiser: those run before constructor
   * parameter properties are assigned, so `this.generationService` would be
   * undefined. It broke the parent component's spec, not just this one's.
   */
  cases: readonly RegionCase[] = [];
  readonly totalBadges = ALL_BADGE_IDS.size;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.themeService.isDark$;
    this.cases = this.buildCases();

    this.subscriptions.add(
      this.badgeDexService.earned$.subscribe(earned => (this.earned = earned)),
    );
    this.subscriptions.add(
      this.generationService.getGeneration().subscribe(generation => {
        this.currentGenerationId = generation.id;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get earnedCount(): number {
    return this.earned.size;
  }

  hasBadge(badge: Badge): boolean {
    return this.earned.has(badgeId(badge));
  }

  /** A region counts as complete when every round has yielded a badge. */
  isRegionComplete(region: RegionCase): boolean {
    return region.rounds.every(round => round.badges.some(badge => this.hasBadge(badge)));
  }

  earnedInRegion(region: RegionCase): number {
    return region.rounds.filter(round => round.badges.some(badge => this.hasBadge(badge))).length;
  }



  private buildCases(): RegionCase[] {
    return this.generationService.getGenerationList().map(generation => ({
      generationId: generation.id,
      region: generation.region,
      rounds: (badgesByGeneration[generation.id] ?? []).map(round => ({
        badges: Array.isArray(round) ? round : [round],
      })),
    }));
  }
}
