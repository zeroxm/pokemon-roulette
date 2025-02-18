import { TestBed } from '@angular/core/testing';

import { TrainerService } from './trainer.service';
import { HttpClient } from '@angular/common/http';

describe('TrainerService', () => {
  let service: TrainerService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(TrainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
