import { Component, EventEmitter, Input, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-snorlax-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './snorlax-roulette.component.html',
  styleUrl: './snorlax-roulette.component.css'
})
export class SnorlaxRouletteComponent {

  @Input() currentRound!: number;
  @Output() runAwayEvent = new EventEmitter<void>();
  @Output() catchSnorlaxEvent = new EventEmitter<void>();
  @Output() defeatSnorlaxEvent = new EventEmitter<EventSource>();

  outcomes: WheelItem[] = [];

  ngOnInit(): void {
    this.outcomes = [
      { text: 'Snorlax runs away', fillStyle: 'crimson', weight: 8 - this.currentRound },
      { text: 'Catch Snorlax', fillStyle: 'blue', weight: 2 + this.currentRound },
      { text: 'Defeat Snorlax', fillStyle: 'green', weight: 2 + this.currentRound }
    ];
  }

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.runAwayEvent.emit();
        break;
      case 1:
        this.catchSnorlaxEvent.emit();
        break;
      case 2:
        this.defeatSnorlaxEvent.emit('snorlax-encounter');
        break;
    }
  }
}
