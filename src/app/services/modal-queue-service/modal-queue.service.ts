import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ModalQueueService {
  private queue: Promise<void> = Promise.resolve();
  private activeModal: NgbModalRef | null = null;

  constructor(private ngbModal: NgbModal) {}

  open(content: any, options?: NgbModalOptions): Promise<NgbModalRef> {
    const openModal = async (): Promise<NgbModalRef> => {
      if (this.activeModal) {
        try {
          await this.activeModal.result;
        } catch {
          // Dismissed modals still resolve the queue step.
        }
      }

      const modalRef = this.ngbModal.open(content, options);
      this.activeModal = modalRef;

      // `.finally()` returns a *new* promise that adopts the rejection a dismissal produces
      // (backdrop click, Esc, the X). Nothing consumes it, so without the catch every dismissed
      // modal logged an unhandled rejection.
      modalRef.result
        .finally(() => {
          if (this.activeModal === modalRef) {
            this.activeModal = null;
          }
        })
        .catch(() => undefined);

      return modalRef;
    };

    const scheduledOpen = this.queue.then(openModal, openModal);

    this.queue = scheduledOpen.then(
      (modalRef) => modalRef.result.then(() => undefined, () => undefined),
      () => undefined
    );

    // Callers await the ref, not the outcome; a failed open must not surface as unhandled either.
    scheduledOpen.catch(() => undefined);
    return scheduledOpen;
  }

  dismissAll(reason?: any): void {
    this.ngbModal.dismissAll(reason);
    this.activeModal = null;
  }
}
