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

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormRuleService);
  });

  const heldStones = (): ItemName[] => ['charizardite-x' as ItemName];

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

      service.applyAll(team, stored, heldStones());
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
      service.applyAll(team, [], heldStones());

      // Simulate the Pokémon vanishing entirely — revert finds nothing to do.
      team.length = 0;
      service.revertAll(team, []);

      // A stale record here is what used to disable mega evolution for the rest of the run.
      const secondTeam = [mon(CHARIZARD)];
      expect(service.applyAll(secondTeam, [], heldStones()))
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

  describe('item gating', () => {
    it('does nothing without the stone', () => {
      const team = [mon(CHARIZARD)];
      expect(service.applyAll(team, [], [])).toBeFalse();
      expect(team[0].pokemonId).toBe(CHARIZARD);
    });
  });
});
