import { TestBed } from '@angular/core/testing';

import { ItemSpriteService } from './item-sprite.service';

describe('ItemSpriteService', () => {
  let service: ItemSpriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemSpriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
