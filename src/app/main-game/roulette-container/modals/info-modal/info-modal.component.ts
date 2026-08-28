import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * Plain title-and-message notice.
 *
 * Both inputs are already-resolved text rather than translation keys, matching how
 * the inline template it replaces was fed.
 */
@Component({
  selector: 'app-info-modal',
  imports: [],
  templateUrl: './info-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../modal-shared.css'
})
export class InfoModalComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
