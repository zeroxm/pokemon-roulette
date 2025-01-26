import { TestBed } from '@angular/core/testing';

import { BadgesService } from './badges.service';

describe('BadgesService', () => {
  let service: BadgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
