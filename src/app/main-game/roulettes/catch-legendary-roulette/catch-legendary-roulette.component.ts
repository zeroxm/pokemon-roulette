import { Component, EventEmitter, Output } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";

@Component({
  selector: 'app-catch-legendary-roulette',
  imports: [WheelComponent],
  templateUrl: './catch-legendary-roulette.component.html',
  styleUrl: './catch-legendary-roulette.component.css'
})
export class CatchLegendaryRouletteComponent {

  catchRate = [
    { text: 'yes', fillStyle: 'green', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 1 },
  ];

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
