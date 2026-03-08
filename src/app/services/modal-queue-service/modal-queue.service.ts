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

      modalRef.result.finally(() => {
        if (this.activeModal === modalRef) {
          this.activeModal = null;
        }
      });

      return modalRef;
    };

    const scheduledOpen = this.queue.then(openModal, openModal);

    this.queue = scheduledOpen.then(
      (modalRef) => modalRef.result.then(() => undefined, () => undefined),
      () => undefined
    );

    return scheduledOpen;
  }

  dismissAll(reason?: any): void {
    this.ngbModal.dismissAll(reason);
    this.activeModal = null;
  }
}
