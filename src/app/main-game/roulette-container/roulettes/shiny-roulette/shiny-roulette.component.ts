import { Component, EventEmitter, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shiny-roulette',
  imports: [WheelComponent, TranslatePipe, CommonModule],
  templateUrl: './shiny-roulette.component.html',
  styleUrl: './shiny-roulette.component.css'
})
export class ShinyRouletteComponent {

  @Output () isShinyEvent = new EventEmitter<boolean>();

  shinyOdds: WheelItem[] = [
    { text: 'game.main.roulette.shiny.yes', fillStyle: 'green', weight: 1 },
    { text: 'game.main.roulette.shiny.no', fillStyle: 'crimson', weight: 63 }
  ];

  onItemSelected(index: number): void {
    this.isShinyEvent.emit(this.shinyOdds[index].text === 'game.main.roulette.shiny.yes');
  }
}
