import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { PokemonType } from '../../../../interfaces/pokemon-type';
import { FRIEND_SAFARI_TYPES, FriendSafariTypeItem } from './friend-safari-types';

/**
 * Step one of the Friend Safari: which type of safari the player found.
 *
 * The catch itself needs no component — the container queues the type's pool through
 * `requestPokemonSelection`, which is the existing "pick one of these Pokémon" wheel.
 */
@Component({
  selector: 'app-friend-safari-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './friend-safari-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './friend-safari-roulette.component.css'
})
export class FriendSafariRouletteComponent {
  @Output() typeSelectedEvent = new EventEmitter<PokemonType>();

  /** Mutable copy: `WheelComponent`'s `items` input is not readonly. */
  readonly types: FriendSafariTypeItem[] = [...FRIEND_SAFARI_TYPES];

  onItemSelected(index: number): void {
    this.typeSelectedEvent.emit(this.types[index].type);
  }
}
