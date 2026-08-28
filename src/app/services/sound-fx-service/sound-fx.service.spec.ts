import { TestBed } from '@angular/core/testing';
import { SoundFxService } from './sound-fx.service';
import { SettingsService } from '../settings-service/settings.service';

describe('SoundFxService', () => {
  let service: SoundFxService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [SettingsService] });
    service = TestBed.inject(SoundFxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sound identity (CQ-04)', () => {
    it('treats the same sound as the same thing across callers', () => {
      // Two components asking for 'item-found' must share one clip, or preventOverlap is
      // scoped to the caller instead of the sound and they talk over each other.
      const first = (service as any).clip('item-found');
      const second = (service as any).clip('item-found');

      expect(first).toBe(second);
    });

    it('does not accumulate a clip per request (SEC-20)', () => {
      for (let i = 0; i < 50; i++) {
        (service as any).clip('click');
      }

      expect((service as any).clips.size)
        .withContext('clips are keyed by sound, not by caller')
        .toBe(1);
    });

    it('registers ended listeners against the sound, not a handle', () => {
      const listener = jasmine.createSpy('listener');
      const unregister = service.onSoundFxEnded('pc-turning-on', listener);

      (service as any).emitEnded((service as any).clip('pc-turning-on'));
      expect(listener).toHaveBeenCalledTimes(1);

      unregister();
      (service as any).emitEnded((service as any).clip('pc-turning-on'));
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('queue does not stall forever (SEC-21)', () => {
    it('stops waiting for an ended event that never arrives', async () => {
      jasmine.clock().install();

      const pending = (service as any).waitForSoundFxEnded('click');
      let resolved = false;
      pending.promise.then(() => { resolved = true; });

      // A backgrounded tab suspends the AudioContext, so onended never fires.
      jasmine.clock().tick(30_000);
      jasmine.clock().uninstall();
      await Promise.resolve();

      expect(resolved)
        .withContext('an unbounded wait here stalls whatever game flow awaits the queue')
        .toBeTrue();
    });

    it('still resolves normally when the sound does end', async () => {
      const pending = (service as any).waitForSoundFxEnded('click');
      (service as any).emitEnded((service as any).clip('click'));

      await expectAsync(pending.promise).toBeResolved();
    });
  });
});
