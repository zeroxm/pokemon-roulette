import { TestBed } from '@angular/core/testing';

import { EvolutionService } from './evolution.service';
import { HttpClient } from '@angular/common/http';

describe('EvolutionService', () => {
  let service: EvolutionService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(EvolutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
