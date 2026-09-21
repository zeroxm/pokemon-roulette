import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Carries a Dynamax Band tap from the team panel to the game loop.
 *
 * The same shape as `MegaStoneService` and for the same reason: the button lives in the team
 * panel, the decision lives in the roulette container, and nothing sensible connects them
 * directly. No payload, because there is nothing to say: Dynamax is always the lead.
 */
@Injectable({ providedIn: 'root' })
export class DynamaxService {
  private dynamaxTriggerSubject = new Subject<void>();

  get dynamaxTrigger$(): Observable<void> {
    return this.dynamaxTriggerSubject.asObservable();
  }

  triggerDynamax(): void {
    this.dynamaxTriggerSubject.next();
  }
}
