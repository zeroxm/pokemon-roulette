import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The better of the game's two catch chances: a third before the fourth gym,
 * two thirds after it, against the legendary wheel's quarter and half.
 *
 * Shared by Area Zero and the Ultra Wormhole, which is why it is not named
 * for either. Both hand over something rare and ask the same question.
 */
@Component({
  selector: 'app-catch-chance-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './catch-chance-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './catch-chance-roulette.component.css'
})
export class CatchChanceRouletteComponent implements OnInit {

  catchRate = [
    { text: 'game.main.roulette.legendary.yes', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.legendary.no', fillStyle: 'crimson', weight: 2 }
  ];

  ngOnInit(): void {
    if (this.currentRound >= 4) {
      this.catchRate = [
        { text: 'game.main.roulette.legendary.yes', fillStyle: 'green', weight: 2 },
        { text: 'game.main.roulette.legendary.no', fillStyle: 'crimson', weight: 1 },
      ];
    }
  }

  @Input() currentRound: number = 0;
  @Output() caughtEvent = new EventEmitter<void>();
  @Output() escapedEvent = new EventEmitter<void>();

  onItemSelected(index: number): void {
    if (this.catchRate[index].text === 'game.main.roulette.legendary.yes') {
      this.caughtEvent.emit();
    } else {
      this.escapedEvent.emit();
    }
  }
}
