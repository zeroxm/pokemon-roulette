import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WORMHOLE_COLOURS, WormholeColour, WormholeColourItem } from './ultra-wormhole-pokemon';

/**
 * Step one of the Ultra Wormhole, which wormhole the player fell through.
 *
 * The catch needs no component of its own: the container queues the colour's
 * Pokémon through `requestPokemonSelection` and then through the shared catch
 * chance, exactly as the Friend Safari and Area Zero already do.
 */
@Component({
  selector: 'app-ultra-wormhole-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './ultra-wormhole-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ultra-wormhole-roulette.component.css',
})
export class UltraWormholeRouletteComponent {
  @Output() colourSelectedEvent = new EventEmitter<WormholeColour>();

  /** Mutable copy: `WheelComponent`'s `items` input is not readonly. */
  readonly colours: WormholeColourItem[] = [...WORMHOLE_COLOURS];

  onItemSelected(index: number): void {
    this.colourSelectedEvent.emit(this.colours[index].colour);
  }
}
