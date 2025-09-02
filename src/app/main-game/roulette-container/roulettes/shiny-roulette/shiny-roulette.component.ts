import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { SettingsService } from '../../../../services/settings-service/settings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shiny-roulette',
  imports: [WheelComponent, TranslatePipe, CommonModule],
  templateUrl: './shiny-roulette.component.html',
  styleUrl: './shiny-roulette.component.css'
})
export class ShinyRouletteComponent implements OnInit {

  @Output () isShinyEvent = new EventEmitter<boolean>();

  shinyOdds: WheelItem[] = [
    { text: 'yes', fillStyle: 'green', weight: 1 },
    { text: 'no', fillStyle: 'crimson', weight: 63 }
  ];

  constructor(public settingsService: SettingsService) {}

  ngOnInit(): void {
    // Check if shiny rolls should be skipped
    if (this.settingsService.currentSettings.skipShinyRolls) {
      // Automatically determine if Pokemon is shiny (1/64 chance)
      const isShiny = Math.random() < (1/64);
      this.isShinyEvent.emit(isShiny);
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
