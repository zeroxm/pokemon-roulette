import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WheelItem } from '../../../interfaces/wheel-item';
import { WheelComponent } from "../../../wheel/wheel.component";

@Component({
  selector: 'app-shiny-roulette',
  imports: [WheelComponent],
  templateUrl: './shiny-roulette.component.html',
  styleUrl: './shiny-roulette.component.css'
})
export class ShinyRouletteComponent implements OnInit {
  
  @Output () isShinyEvent = new EventEmitter<boolean>();

  shinyOdds: WheelItem[] = [];

  ngOnInit(): void {
    this.shinyOdds.push({ text: 'yes', fillStyle: 'green', weight: 1 });
    for (let index = 0; index < 63; index++) {
      this.shinyOdds.push({ text: 'no', fillStyle: 'crimson', weight: 1 });
    }
  }

  onItemSelected(index: number): void {
    if (this.shinyOdds[index].text === 'yes') {
      this.isShinyEvent.emit(true);
    } else {
      this.isShinyEvent.emit(false);
    };
  }
}
