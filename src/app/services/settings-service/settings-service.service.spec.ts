import { TestBed } from '@angular/core/testing';

import { SettingsServiceService } from './settings-service.service';

describe('SettingsServiceService', () => {
  let service: SettingsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
