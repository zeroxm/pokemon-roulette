import { TestBed } from '@angular/core/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalQueueService } from './modal-queue.service';

describe('ModalQueueService', () => {
  let service: ModalQueueService;
  let opened: string[];
  let pending: Map<string, { resolve: () => void; reject: () => void }>;

  /** A modal whose result the test controls, so ordering can be observed. */
  const fakeModal = (name: string): NgbModalRef => {
    let resolve!: () => void;
    let reject!: () => void;
    const result = new Promise<void>((res, rej) => {
      resolve = () => res();
      reject = () => rej(new Error('dismissed'));
    });
    result.catch(() => undefined);          // the test itself must not leak a rejection
    pending.set(name, { resolve, reject });
    return { result, componentInstance: {}, close: resolve, dismiss: reject } as unknown as NgbModalRef;
  };

  beforeEach(() => {
    opened = [];
    pending = new Map();

    const ngbModal = {
      open: jasmine.createSpy('open').and.callFake((content: string) => {
        opened.push(content);
        return fakeModal(content);
      }),
      dismissAll: jasmine.createSpy('dismissAll'),
    };

    TestBed.configureTestingModule({ providers: [{ provide: NgbModal, useValue: ngbModal }] });
    service = TestBed.inject(ModalQueueService);
  });

  const flush = () => new Promise(resolve => setTimeout(resolve, 0));

  it('opens the second modal only after the first closes', async () => {
    void service.open('first' as never);
    void service.open('second' as never);
    await flush();

    expect(opened).withContext('the second must wait its turn').toEqual(['first']);

    pending.get('first')!.resolve();
    await flush();

    expect(opened).toEqual(['first', 'second']);
  });

  it('lets the queue continue when a modal is dismissed rather than closed', async () => {
    void service.open('first' as never);
    void service.open('second' as never);
    await flush();

    // Backdrop click / Esc rejects the result. The queue must not stall on it.
    pending.get('first')!.reject();
    await flush();

    expect(opened)
      .withContext('a dismissal is a normal outcome, not a failure')
      .toEqual(['first', 'second']);
  });

  it('preserves order across three modals', async () => {
    void service.open('a' as never);
    void service.open('b' as never);
    void service.open('c' as never);
    await flush();

    pending.get('a')!.resolve(); await flush();
    pending.get('b')!.reject();  await flush();   // a mix of close and dismiss

    expect(opened).toEqual(['a', 'b', 'c']);
  });

  it('dismissAll clears the active modal so the next open is not blocked', async () => {
    void service.open('first' as never);
    await flush();

    service.dismissAll();
    void service.open('second' as never);
    pending.get('first')!.reject();
    await flush();

    expect(opened).toContain('second');
  });
});
