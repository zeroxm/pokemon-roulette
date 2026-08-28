import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

/** Entei intervenes and Team Rocket's theft fails. Fixed copy, no inputs. */
@Component({
  selector: 'app-team-rocket-fails-modal',
  imports: [TranslatePipe],
  templateUrl: './team-rocket-fails-modal.component.html',
  styleUrl: '../modal-shared.css'
})
export class TeamRocketFailsModalComponent {
  readonly enteiArtwork =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/244.png';

  constructor(public activeModal: NgbActiveModal) {}
}
