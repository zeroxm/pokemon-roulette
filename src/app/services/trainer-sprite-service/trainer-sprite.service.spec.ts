import { TestBed } from '@angular/core/testing';

import { TrainerSpriteService } from './trainer-sprite.service';

describe('TrainerSpriteService', () => {
  let service: TrainerSpriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerSpriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
