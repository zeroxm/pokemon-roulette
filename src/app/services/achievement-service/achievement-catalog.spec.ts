import { ACHIEVEMENTS, AchievementContext, achievementDescriptionKey, achievementNameKey } from './achievement-catalog';

describe('the achievement catalog', () => {
  const emptyContext: AchievementContext = {
    stats: {},
    caught: new Set(),
    shinyIds: new Set(),
    megaCount: 0,
    badges: new Set(),
    highestCatchCount: 0,
  };

  it('holds the whole catalog', () => {
    expect(ACHIEVEMENTS.length)
      .withContext('adding one needs the backend allowlist updated first, or the unlock is skipped on sync')
      .toBe(51);
  });

  it('has no duplicate ids', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses ids the backend will accept', () => {
    // The server validates against ^[a-z0-9_]{1,64}$ and rejects anything else,
    // so a stray dot or capital here would be silently dropped on sync.
    for (const { id } of ACHIEVEMENTS) {
      expect(id).withContext(`${id} is not a valid achievement id`).toMatch(/^[a-z0-9_]{1,64}$/);
    }
  });

  it('derives translation keys from the id', () => {
    expect(achievementNameKey('oh_shiny')).toBe('achievements.oh_shiny.name');
    expect(achievementDescriptionKey('oh_shiny')).toBe('achievements.oh_shiny.description');
  });

  it('reports no progress and no target of zero on an empty account', () => {
    for (const achievement of ACHIEVEMENTS) {
      const progress = achievement.progress(emptyContext);

      expect(progress.current)
        .withContext(`${achievement.id} starts part-way done`)
        .toBe(0);
      expect(progress.target)
        .withContext(`${achievement.id} has a target of zero, so it would unlock immediately`)
        .toBeGreaterThan(0);
    }
  });

  it('counts a caught Pokémon towards the collection tiers', () => {
    const context: AchievementContext = { ...emptyContext, caught: new Set([25]) };
    const first = ACHIEVEMENTS.find(a => a.id === 'i_choose_you')!;

    expect(first.progress(context)).toEqual({ current: 1, target: 1 });
  });

  it('treats a shiny legendary as earned only for a legendary', () => {
    const achievement = ACHIEVEMENTS.find(a => a.id === 'never_tell_me_the_odds')!;

    // Pikachu is not legendary.
    expect(achievement.progress({ ...emptyContext, shinyIds: new Set([25]) }).current).toBe(0);
    // Mewtwo is.
    expect(achievement.progress({ ...emptyContext, shinyIds: new Set([150]) }).current).toBe(1);
  });

  it('measures regional dex progress against the region you are closest to finishing', () => {
    const achievement = ACHIEVEMENTS.find(a => a.id === 'gotta_catch_em_all_regional')!;

    // Two of Johto's hundred beats one of Kanto's hundred and fifty-one.
    const progress = achievement.progress({ ...emptyContext, caught: new Set([1, 152, 153]) });

    expect(progress.target).withContext('Johto has 100 species').toBe(100);
    expect(progress.current).toBe(2);
  });

});
