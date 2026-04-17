import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BadgesService } from './badges.service';
import { GenerationItem } from '../../interfaces/generation-item';

describe('BadgesService', () => {
  let service: BadgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an observable (undefined payload) when generation id is not in the map', async () => {
    const unknownGen = { id: 99 } as GenerationItem;
    const result = await firstValueFrom(service.getBadge(unknownGen, 0, 0));
    expect(result).toBeUndefined();
  });

  it('should return an observable (undefined payload) when fromRound is out of range', async () => {
    const gen1 = { id: 1 } as GenerationItem;
    const result = await firstValueFrom(service.getBadge(gen1, 999, 0));
    expect(result).toBeUndefined();
  });
});
