import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { bootstrapAward } from '@ng-icons/bootstrap-icons';

import { AchievementsComponent } from './achievements.component';
import { AchievementService } from '../../services/achievement-service/achievement.service';
import { StatsService } from '../../services/stats-service/stats.service';
import { ACHIEVEMENTS } from '../../services/achievement-service/achievement-catalog';

describe('AchievementsComponent', () => {
  let fixture: ComponentFixture<AchievementsComponent>;
  let component: AchievementsComponent;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AchievementsComponent],
      providers: [provideTranslateService(), provideIcons({ bootstrapAward })],
    }).compileComponents();

    TestBed.inject(AchievementService);
    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('shows every achievement exactly once', () => {
    const shown = component.groups.flatMap(group => group.achievements.map(a => a.id));

    expect(shown.length).toBe(ACHIEVEMENTS.length);
    expect(new Set(shown).size)
      .withContext('a group filter that overlaps would list one twice')
      .toBe(ACHIEVEMENTS.length);
  });

  it('reports progress for a locked achievement', () => {
    TestBed.inject(StatsService).increment('rival_battles_won', 3);
    fixture.detectChanges();

    const notch = ACHIEVEMENTS.find(a => a.id === 'notch_above')!;

    expect(component.progressFor(notch)).toEqual({ current: 3, target: 5 });
    expect(component.percentFor(notch)).toBe(60);
  });

  it('marks an achievement unlocked', () => {
    TestBed.inject(StatsService).increment('runs_completed');
    fixture.detectChanges();

    const champion = ACHIEVEMENTS.find(a => a.id === 'champion')!;

    expect(component.isUnlocked(champion)).toBeTrue();
    expect(component.unlockedCount).toBeGreaterThan(0);
  });

  // A stored unlock outlives the threshold that earned it, so current can
  // exceed target. An uncapped bar would overflow its track.
  it('caps the bar at 100%', () => {
    TestBed.inject(StatsService).increment('rival_battles_won', 99);
    fixture.detectChanges();

    const smell = ACHIEVEMENTS.find(a => a.id === 'smell_ya_later')!;

    expect(component.percentFor(smell)).toBe(100);
  });

  it('conceals a hidden achievement until it is earned', () => {
    const stadium = ACHIEVEMENTS.find(a => a.id === 'pokemon_stadium')!;
    expect(component.isConcealed(stadium)).toBeTrue();

    TestBed.inject(StatsService).recordChampion(1, 3);
    fixture.detectChanges();

    expect(component.isConcealed(stadium))
      .withContext('once earned there is nothing left to hide')
      .toBeFalse();
  });

  it('does not conceal an ordinary locked achievement', () => {
    expect(component.isConcealed(ACHIEVEMENTS.find(a => a.id === 'veteran')!)).toBeFalse();
  });

  it('reports lifetime totals', () => {
    TestBed.inject(StatsService).increment('spins_total', 430);
    fixture.detectChanges();

    const spins = component.totals.find(t => t.labelKey.endsWith('.spins'));

    expect(spins?.value).toBe(430);
  });
});
