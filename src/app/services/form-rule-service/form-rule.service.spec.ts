import { TestBed } from '@angular/core/testing';
import { FormRuleService } from './form-rule.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { ItemName } from '../items-service/item-names';

const mon = (pokemonId: number, over: Partial<PokemonItem> = {}): PokemonItem => ({
  pokemonId, text: `pokemon.${pokemonId}`, fillStyle: 'red', weight: 1,
  sprite: null, shiny: false, power: 1, ...over,
} as PokemonItem);

describe('FormRuleService', () => {
  let service: FormRuleService;

  const CHARIZARD = 6;
  const MEGA_CHARIZARD_X = 10034;
  const PALAFIN = 964;
  const PALAFIN_HERO = 10256;
  const MIMIKYU = 778;
  const MIMIKYU_BUSTED = 10143;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormRuleService);
  });

  const heldStones = (): ItemName[] => ['charizardite-x' as ItemName];

  /** The tap path: mega evolution is `manual`, so this is the only way it ever applies. */
  const tapStone = (team: PokemonItem[], stored: PokemonItem[] = []): boolean =>
    service.forceApply(`mega:${CHARIZARD}`, team, stored, heldStones());

  describe('apply is idempotent (SEC-03)', () => {
    it('a second apply cannot toggle a sticky form back', () => {
      const aegislash = mon(681);              // Aegislash Shield
      const team = [aegislash];

      service.applyAll(team, [], []);
      const afterFirst = team[0].pokemonId;

      service.applyAll(team, [], []);
      expect(team[0].pokemonId)
        .withContext('a repeated battle-state emission must not toggle again')
        .toBe(afterFirst);
    });
  });

  describe('revert sweeps storage (SEC-02)', () => {
    it('reverts a mega form that was moved to the PC mid-battle', () => {
      const team = [mon(CHARIZARD)];
      const stored: PokemonItem[] = [];

      tapStone(team, stored);
      expect(team[0].pokemonId).toBe(MEGA_CHARIZARD_X);

      // The player drags the mega-evolved Pokémon into storage before the battle ends.
      stored.push(team.shift()!);

      service.revertAll(team, stored);
      expect(stored[0].pokemonId)
        .withContext('a mega form left in the PC must still change back')
        .toBe(CHARIZARD);
    });

    it('clears its bookkeeping even when it reverts nothing (SEC-05)', () => {
      const team = [mon(CHARIZARD)];
      tapStone(team);

      // Simulate the Pokémon vanishing entirely — revert finds nothing to do.
      team.length = 0;
      service.revertAll(team, []);

      // A stale record here is what used to disable mega evolution for the rest of the run.
      const secondTeam = [mon(CHARIZARD)];
      expect(tapStone(secondTeam))
        .withContext('a later battle must still be able to mega-evolve')
        .toBeTrue();
      expect(secondTeam[0].pokemonId).toBe(MEGA_CHARIZARD_X);
    });
  });

  describe('battle-only forms', () => {
    it('promotes a base Palafin and returns it afterwards', () => {
      const team = [mon(PALAFIN)];

      service.applyAll(team, [], []);
      expect(team[0].pokemonId).toBe(PALAFIN_HERO);

      service.revertAll(team, []);
      expect(team[0].pokemonId).toBe(PALAFIN);
    });

    it('leaves a Pokémon already in its battle form alone on the way in', () => {
      const team = [mon(PALAFIN_HERO)];
      service.applyAll(team, [], []);
      expect(team[0].pokemonId).toBe(PALAFIN_HERO);
    });

    it('carries the shiny flag across a swap', () => {
      const team = [mon(PALAFIN, { shiny: true })];

      service.applyAll(team, [], []);
      expect(team[0].shiny).withContext('shiny must survive the form change').toBeTrue();

      service.revertAll(team, []);
      expect(team[0].shiny).toBeTrue();
    });
  });

  describe('reverting a mega form', () => {
    it('keeps the sprite the base form had already resolved (SEC-08)', () => {
      const resolved = { front_default: 'charizard.png', front_shiny: 'charizard-shiny.png' };
      const team = [mon(CHARIZARD, { sprite: resolved })];

      tapStone(team);
      expect(team[0].sprite).withContext('the new form fetches its own artwork').toBeNull();

      service.revertAll(team, []);
      expect(team[0].sprite)
        .withContext('the base form should not need refetching')
        .toEqual(resolved);
    });

    it('restores the stats the Pokémon had before transforming', () => {
      const team = [mon(CHARIZARD, { power: 4, type1: 'fire', type2: 'flying' } as Partial<PokemonItem>)];

      tapStone(team);
      service.revertAll(team, []);

      expect(team[0].power).toBe(4);
      expect(team[0].type1).toBe('fire');
      expect(team[0].type2).toBe('flying');
    });
  });

  describe('item gating', () => {
    it('does nothing without the stone', () => {
      const team = [mon(CHARIZARD)];
      expect(service.forceApply(`mega:${CHARIZARD}`, team, [], [])).toBeFalse();
      expect(team[0].pokemonId).toBe(CHARIZARD);
    });
  });

  describe("Mimikyu's Disguise", () => {
    const bust = (team: PokemonItem[], stored: PokemonItem[] = []): boolean =>
      service.forceApply(`disguise:${MIMIKYU}`, team, stored, []);

    it('does not bust on entering a battle', () => {
      const team = [mon(MIMIKYU)];

      service.applyAll(team, [], []);

      expect(team[0].pokemonId)
        .withContext('the disguise breaks on a defeat, not on walking into a fight')
        .toBe(MIMIKYU);
    });

    it('busts when asked, and survives the end of the battle', () => {
      const team = [mon(MIMIKYU)];

      expect(bust(team)).toBeTrue();
      expect(team[0].pokemonId).toBe(MIMIKYU_BUSTED);

      service.revertAll(team, []);

      expect(team[0].pokemonId)
        .withContext('sticky: the busted disguise is meant to last the rest of the run')
        .toBe(MIMIKYU_BUSTED);
    });

    it('reports no change for an already-busted Mimikyu', () => {
      const team = [mon(MIMIKYU_BUSTED)];

      expect(bust(team))
        .withContext('the caller uses this to decide whether the retry was earned')
        .toBeFalse();
      expect(team[0].pokemonId).toBe(MIMIKYU_BUSTED);
    });

    it('keeps the shiny flag when the disguise breaks', () => {
      const team = [mon(MIMIKYU, { shiny: true })];

      bust(team);

      expect(team[0].shiny).toBeTrue();
    });

    it('does not change the battle odds', () => {
      const team = [mon(MIMIKYU, { power: 2 })];
      const before = team[0].power;

      bust(team);

      expect(team[0].power)
        .withContext('a free retry must not double as a stat change')
        .toBe(before);
    });
  });

  describe('mega evolution is player-initiated, never automatic', () => {
    it('does not mega-evolve on entering a battle, even holding the stone', () => {
      const team = [mon(CHARIZARD)];

      const changed = service.applyAll(team, [], heldStones());

      expect(team[0].pokemonId)
        .withContext('owning a stone selects which mega form is available, not that one happens')
        .toBe(CHARIZARD);
      expect(changed).toBeFalse();
    });

    it('leaves a mega form applied when the battle-start pass runs afterwards', () => {
      const team = [mon(CHARIZARD)];
      tapStone(team);
      expect(team[0].pokemonId).toBe(MEGA_CHARIZARD_X);

      service.applyAll(team, [], heldStones());

      expect(team[0].pokemonId)
        .withContext('a later battle-state emission must not disturb an active mega')
        .toBe(MEGA_CHARIZARD_X);
    });

    it('still applies battle-start rules for other Pokémon in the same team', () => {
      const team = [mon(CHARIZARD), mon(PALAFIN)];

      service.applyAll(team, [], heldStones());

      expect(team[0].pokemonId).withContext('mega stays manual').toBe(CHARIZARD);
      expect(team[1].pokemonId).withContext('Palafin still promotes automatically').toBe(PALAFIN_HERO);
    });

    it('reverts a tapped mega at battle end as before', () => {
      const team = [mon(CHARIZARD)];
      tapStone(team);

      expect(service.revertAll(team, [])).toBeTrue();
      expect(team[0].pokemonId).toBe(CHARIZARD);
    });
  });
});
