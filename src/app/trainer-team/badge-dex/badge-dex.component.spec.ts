import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { bootstrapTrophy } from '@ng-icons/bootstrap-icons';

import { BadgeDexComponent } from './badge-dex.component';
import { BadgeDexService } from '../../services/badge-dex-service/badge-dex.service';

describe('BadgeDexComponent', () => {
  let fixture: ComponentFixture<BadgeDexComponent>;
  let component: BadgeDexComponent;
  let badgeDex: BadgeDexService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [BadgeDexComponent],
      providers: [provideTranslateService(), provideIcons({ bootstrapTrophy })],
    }).compileComponents();

    badgeDex = TestBed.inject(BadgeDexService);
    fixture = TestBed.createComponent(BadgeDexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => localStorage.clear());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('shows every region', () => {
    expect(component.cases.length).toBe(9);
  });

  it('groups a region into its eight gyms', () => {
    for (const region of component.cases) {
      expect(region.rounds.length)
        .withContext(`${region.region} should have eight rounds`)
        .toBe(8);
    }
  });

  it('counts every badge in the game, alternatives included', () => {
    expect(component.totalBadges).toBe(77);
  });

  it('starts with nothing earned', () => {
    expect(component.earnedCount).toBe(0);
    expect(component.cases.every(region => !component.isRegionComplete(region))).toBeTrue();
  });

  it('marks a badge once it has been earned', () => {
    const kanto = component.cases[0];
    const first = kanto.rounds[0].badges[0];

    expect(component.hasBadge(first)).toBeFalse();

    badgeDex.record(first);
    fixture.detectChanges();

    expect(component.hasBadge(first)).toBeTrue();
    expect(component.earnedInRegion(kanto)).toBe(1);
  });

  // A round offering a choice is satisfied by any one of its badges — you can
  // only win one per run, and beating the gym is what counts.
  it('counts a round complete with any one of its alternatives', () => {
    const alola = component.cases.find(region => region.generationId === 7)!;
    const choice = alola.rounds.find(round => round.badges.length > 1)!;

    badgeDex.record(choice.badges[0]);
    fixture.detectChanges();

    expect(component.earnedInRegion(alola))
      .withContext('one of the alternatives is the whole round')
      .toBe(1);
  });

  it('calls a region complete only when every gym has yielded a badge', () => {
    const kanto = component.cases[0];

    for (const round of kanto.rounds.slice(0, 7)) {
      badgeDex.record(round.badges[0]);
    }
    fixture.detectChanges();
    expect(component.isRegionComplete(kanto))
      .withContext('seven of eight is not the Victory Road')
      .toBeFalse();

    badgeDex.record(kanto.rounds[7].badges[0]);
    fixture.detectChanges();
    expect(component.isRegionComplete(kanto)).toBeTrue();
  });
});
