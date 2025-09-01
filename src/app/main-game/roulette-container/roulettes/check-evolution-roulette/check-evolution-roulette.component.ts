import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { EventSource } from '../../../EventSource';

@Component({
  selector: 'app-check-evolution-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './check-evolution-roulette.component.html',
  styleUrl: './check-evolution-roulette.component.css'
})
export class CheckEvolutionRouletteComponent implements OnInit {

  evolveOdds: WheelItem[] = [];

  @Input() evolutionCredits!: number;
  @Output() evolvePokemonEvent = new EventEmitter<EventSource>();
  @Output() evolutionCreditsChange = new EventEmitter<number>();
  @Output() doNothingEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.resetOdds();
  }

  onItemSelected(index: number): void {
    if (this.evolveOdds[index].text === 'yes') {
      this.evolutionCreditsChange.emit(0);
      this.evolvePokemonEvent.emit('gym-battle');
    } else {
      this.evolutionCreditsChange.emit(this.evolutionCredits + 1);
      this.doNothingEvent.emit();
    };
  }

  private resetOdds(): void {
    this.evolveOdds = [
      { text: 'yes', fillStyle: 'green', weight: 1 },
      { text: 'no', fillStyle: 'crimson', weight: 1 },
      { text: 'no', fillStyle: 'crimson', weight: 1 },
      { text: 'no', fillStyle: 'crimson', weight: 1 },
    ];

    for (let i = 0; i < this.evolutionCredits; i++) {
      const firstNoIndex = this.evolveOdds.findIndex(item => item.text === 'no');
      if (firstNoIndex !== -1) {
        this.evolveOdds.splice(firstNoIndex, 1);
      }
    }
  }
}
