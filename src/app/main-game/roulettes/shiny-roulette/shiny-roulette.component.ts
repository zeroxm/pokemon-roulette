import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WheelItem } from '../../../interfaces/wheel-item';
import { WheelComponent } from "../../../wheel/wheel.component";
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-shiny-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './shiny-roulette.component.html',
  styleUrl: './shiny-roulette.component.css'
})
export class ShinyRouletteComponent {

  @Output () isShinyEvent = new EventEmitter<boolean>();

  shinyOdds: WheelItem[] = [
    { text: 'yes', fillStyle: 'green', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 63 }
  ];


  onItemSelected(index: number): void {
    if (this.shinyOdds[index].text === 'yes') {
      this.isShinyEvent.emit(true);
    } else {
      this.isShinyEvent.emit(false);
    };
  }
}
