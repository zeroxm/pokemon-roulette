import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

/** Entei intervenes and Team Rocket's theft fails. Fixed copy, no inputs. */
@Component({
  selector: 'app-team-rocket-fails-modal',
  imports: [
    ImageFallbackDirective,TranslatePipe],
  templateUrl: './team-rocket-fails-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../modal-shared.css'
})
export class TeamRocketFailsModalComponent {
  readonly enteiArtwork =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/244.png';

  constructor(public activeModal: NgbActiveModal) {}
}
