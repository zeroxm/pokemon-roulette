import { InjectionToken } from '@angular/core';
import { ImportResult } from './import-handoff';

/**
 * What a progress transfer brought in, or `null` on every ordinary page load.
 *
 * A token rather than a service because the work happens before Angular
 * exists; this only carries the answer in so the app can tell the player it
 * worked. Arriving to a Pokédex that is silently correct is indistinguishable
 * from arriving to one that silently is not.
 */
export const HANDOFF_RESULT = new InjectionToken<ImportResult | null>('handoff result');
