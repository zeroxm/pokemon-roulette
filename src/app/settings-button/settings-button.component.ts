import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIconsModule } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings-button',
  imports: [
    CommonModule,
    NgIconsModule,
    TranslatePipe
  ],
  templateUrl: './settings-button.component.html',
  styleUrl: './settings-button.component.css'
})
export class SettingsButtonComponent {

  constructor(private router: Router,
              private gameStateService: GameStateService,
              private darkModeService: DarkModeService) {
      this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
    });

    this.darkMode = this.darkModeService.darkMode$;
  }

  wheelSpinning: boolean = false;
  darkMode!: Observable<boolean>;

  goToSettings(): void {
    if (this.wheelSpinning) {
      return;
    }
    this.router.navigate(['settings']);
  }
}
