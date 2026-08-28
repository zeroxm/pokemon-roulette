import { resolveSplitTrainer, splitTrainerCount } from './split-trainer';
import { GymLeader } from '../interfaces/gym-leader';

describe('split-trainer', () => {
  const pair: GymLeader = {
    name: 'leader.pair',
    sprite: ['a.png', 'b.png'],
    quotes: ['quote.a', 'quote.b'],
    types: ['fire', 'water'],
  };

  it('counts the trainers behind one entry', () => {
    expect(splitTrainerCount('Alice/Bob')).toBe(2);
    expect(splitTrainerCount('Solo')).toBe(1);
  });

  it('picks the first trainer whole', () => {
    const resolved = resolveSplitTrainer(pair, 'Alice/Bob', 0);

    expect(resolved.name).toBe('Alice');
    expect(resolved.sprite).toBe('a.png');
    expect(resolved.quotes).toEqual(['quote.a']);
    expect(resolved.types).toEqual(['fire']);
  });

  it('picks the second trainer whole', () => {
    const resolved = resolveSplitTrainer(pair, 'Alice/Bob', 1);

    // The point of this helper: name, sprite, quote and type must all come from the same trainer.
    expect(resolved.name).toBe('Bob');
    expect(resolved.sprite).toBe('b.png');
    expect(resolved.quotes).toEqual(['quote.b']);
    expect(resolved.types).toEqual(['water']);
  });

  it('handles a single-sprite entry', () => {
    const single: GymLeader = { name: 'x', sprite: 'only.png', quotes: ['q'], types: ['grass'] };
    expect(resolveSplitTrainer(single, 'Solo', 0).sprite).toBe('only.png');
  });

  it('leaves types undefined when the entry has none', () => {
    const untyped: GymLeader = { name: 'x', sprite: ['a.png'], quotes: ['q'] };
    expect(resolveSplitTrainer(untyped, 'Solo', 0).types).toBeUndefined();
  });
});
