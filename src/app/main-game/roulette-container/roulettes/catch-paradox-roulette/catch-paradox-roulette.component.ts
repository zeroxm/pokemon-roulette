import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-catch-paradox-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './catch-paradox-roulette.component.html',
  styleUrl: './catch-paradox-roulette.component.css'
})
export class CatchParadoxRouletteComponent implements OnInit {

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
  @Output() catchParadoxEvent = new EventEmitter<void>();
  @Output() nothingHappensEvent = new EventEmitter<void>();

  onItemSelected(index: number): void {
    if (this.catchRate[index].text === 'game.main.roulette.legendary.yes') {
      this.catchParadoxEvent.emit();
    } else {
      this.nothingHappensEvent.emit();
    }
  }
}
