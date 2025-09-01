import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-catch-legendary-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './catch-legendary-roulette.component.html',
  styleUrl: './catch-legendary-roulette.component.css'
})
export class CatchLegendaryRouletteComponent implements OnInit {

  catchRate = [
    { text: 'yes', fillStyle: 'green', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 3 }
  ];

  ngOnInit(): void {
    if (this.currentRound >= 8) {
      this.catchRate = [
        { text: 'yes', fillStyle: 'green', weight: 3 },
        { text: 'no', fillStyle: 'crimson', weight: 1 },
      ];
    } else if (this.currentRound >= 4) {
      this.catchRate = [
        { text: 'yes', fillStyle: 'green', weight: 2 },
        { text: 'no', fillStyle: 'crimson', weight: 2 },
      ];
    }
  }

  @Input() currentRound: number = 0;
  @Output() catchLegendaryEvent = new EventEmitter<void>();
  @Output() nothingHappensEvent = new EventEmitter<void>();

  onItemSelected(index: number): void {
    if (this.catchRate[index].text === 'yes') {
      this.catchLegendaryEvent.emit();
    } else {
      this.nothingHappensEvent.emit();
    };
  }
}
