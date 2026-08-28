import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsServiceService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('reading stored settings (SEC-30q)', () => {
    const read = (stored: unknown): unknown => {
      localStorage.setItem('pokemon-roulette-settings', JSON.stringify(stored));
      return TestBed.inject(SettingsService).currentSettings;
    };

    beforeEach(() => localStorage.clear());

    it('fills in a setting the stored blob predates', () => {
      // What an older build's blob looks like once a new setting is added.
      TestBed.resetTestingModule();
      const settings = read({ muteAudio: true }) as Record<string, unknown>;

      expect(settings['muteAudio']).toBeTrue();
      expect(settings['skipShinyRolls'])
        .withContext('a missing field must take the default, not undefined')
        .toBeFalse();
    });

    it('rejects a field of the wrong type', () => {
      TestBed.resetTestingModule();
      const settings = read({ muteAudio: null }) as Record<string, unknown>;
      expect(settings['muteAudio']).toBeFalse();
    });

    it('rejects an unrecognised gender', () => {
      TestBed.resetTestingModule();
      const settings = read({ defaultGender: 'banana' }) as Record<string, unknown>;
      expect(settings['defaultGender']).toBe('always-choose');
    });

    it('survives corrupt JSON', () => {
      TestBed.resetTestingModule();
      localStorage.setItem('pokemon-roulette-settings', '{not json');
      expect(() => TestBed.inject(SettingsService).currentSettings).not.toThrow();
    });
  });
});
