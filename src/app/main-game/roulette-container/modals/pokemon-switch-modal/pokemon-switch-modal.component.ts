import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { ImageFallbackDirective } from '../../../../directives/image-fallback.directive';

/**
 * "One Pokémon became another" modal: outgoing sprite, a sentence, incoming sprite.
 *
 * Used for both evolution and trade. The markup was identical in each; only the two
 * connecting phrases differ, so they arrive as translation keys.
 */
@Component({
  selector: 'app-pokemon-switch-modal',
  imports: [
    ImageFallbackDirective,TranslatePipe],
  templateUrl: './pokemon-switch-modal.component.html',
  styleUrl: '../modal-shared.css'
})
export class PokemonSwitchModalComponent {
  @Input({ required: true }) titleKey!: string;
  @Input({ required: true }) from!: PokemonItem;
  @Input({ required: true }) to!: PokemonItem;
  /** Key opening the sentence — "Your" (evolve) or "You sent" (trade). */
  @Input({ required: true }) leadKey!: string;
  /** Key joining the two Pokémon — "evolved into" or "and received a". */
  @Input({ required: true }) joinKey!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
