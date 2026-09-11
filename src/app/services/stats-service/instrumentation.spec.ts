import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { StatsService } from './stats.service';
import { SnorlaxRouletteComponent } from '../../main-game/roulette-container/roulettes/snorlax-roulette/snorlax-roulette.component';
import { PokemonPoolRouletteComponent } from '../../main-game/roulette-container/roulettes/pokemon-pool-roulette/pokemon-pool-roulette.component';
import { PokemonPoolId } from '../../main-game/roulette-container/roulettes/pokemon-pool-roulette/pokemon-pools';

/**
 * The counters only mean anything if the game actually moves them. These cover
 * the points where a wheel result becomes a statistic: the rest of the game
 * loop is exercised by the container's own spec.
 */
describe('stats instrumentation', () => {
  let stats: StatsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    stats = TestBed.inject(StatsService);
  });

  afterAll(() => localStorage.clear());

  describe('the Snorlax encounter', () => {
    const spin = (outcome: number) => {
      const fixture = TestBed.createComponent(SnorlaxRouletteComponent);
      fixture.componentInstance.currentRound = 1;
      fixture.detectChanges();
      fixture.componentInstance.onItemSelected(outcome);
    };

    it('counts catching it', () => {
      spin(1);
      expect(stats.get('snorlax_resolved')).toBe(1);
    });

    it('counts defeating it', () => {
      spin(2);
      expect(stats.get('snorlax_resolved')).toBe(1);
    });

    it('does not count running away', () => {
      spin(0);
      expect(stats.get('snorlax_resolved'))
        .withContext('"Used the Pokéflute" is about resolving the encounter, not meeting it')
        .toBe(0);
    });
  });

  describe('pool catches', () => {
    const select = (pool: PokemonPoolId) => {
      const fixture = TestBed.createComponent(PokemonPoolRouletteComponent);
      fixture.componentInstance.pool = pool;
      fixture.detectChanges();
      fixture.componentInstance.onItemSelected(0);
    };

    it('counts a fish', () => {
      select('fish');
      expect(stats.get('fishing_catches')).toBe(1);
    });

    it('counts a fossil', () => {
      select('fossil');
      expect(stats.get('fossil_catches')).toBe(1);
    });

    it('counts nothing for a pool with no achievement behind it', () => {
      select('starter');
      select('cave');

      expect(stats.get('fishing_catches')).toBe(0);
      expect(stats.get('fossil_catches')).toBe(0);
    });
  });
});
