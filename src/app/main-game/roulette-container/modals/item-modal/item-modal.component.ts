import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

/**
 * "Here is an item" modal: heading, sprite, description.
 *
 * Covers both the consolation prizes awarded when nothing can evolve and the
 * notice shown when a held item activates — identical markup, different copy.
 */
@Component({
  selector: 'app-item-modal',
  imports: [
    ImageFallbackDirective,TranslatePipe],
  templateUrl: './item-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../modal-shared.css'
})
export class ItemModalComponent {
  /** Translation key for the heading. */
  @Input({ required: true }) titleKey!: string;
  /** Optional second key appended to the heading, e.g. "<Item>" + "activates!". */
  @Input() titleSuffixKey?: string;
  @Input({ required: true }) sprite!: string;
  @Input({ required: true }) descriptionKey!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
