import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AchievementToastComponent } from './achievement-toast.component';
import { AchievementService } from '../../services/achievement-service/achievement.service';
import { StatsService } from '../../services/stats-service/stats.service';

describe('AchievementToastComponent', () => {
  let fixture: ComponentFixture<AchievementToastComponent>;
  let component: AchievementToastComponent;
  let stats: StatsService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AchievementToastComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    // Instantiated before the component so its first, silent evaluation has
    // already happened — otherwise the toast would announce a fresh account's
    // starting state.
    TestBed.inject(AchievementService);
    stats = TestBed.inject(StatsService);

    fixture = TestBed.createComponent(AchievementToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('shows nothing until something is earned', () => {
    expect(component.current).toBeNull();
  });

  it('announces an achievement', () => {
    stats.increment('runs_won');
    fixture.detectChanges();

    expect(component.current?.id).toBe('champion');
  });

  it('clears itself after a while', fakeAsync(() => {
    stats.increment('runs_won');
    expect(component.current).not.toBeNull();

    tick(5000);

    expect(component.current).toBeNull();
  }));

  // Three overlapping banners is worse than three short ones.
  it('queues several rather than stacking them', fakeAsync(() => {
    // Three at once: first rival win, first run, and the 10-run tier is not
    // reached, so use two counters that each unlock immediately.
    stats.increment('rival_battles_won');
    stats.increment('runs_won');

    const first = component.current;
    expect(first).not.toBeNull();

    tick(5000);

    expect(component.current)
      .withContext('the second one takes its turn rather than appearing alongside')
      .not.toBe(first);

    tick(10000);
    expect(component.current).toBeNull();
  }));

  it('can be dismissed by the player', () => {
    stats.increment('runs_won');
    expect(component.current).not.toBeNull();

    component.dismiss();

    expect(component.current).toBeNull();
  });
});
