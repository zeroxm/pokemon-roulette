import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-settings-button',
  imports: [
    NgIconsModule,
    TranslatePipe
  ],
  templateUrl: './settings-button.component.html',
  styleUrl: './settings-button.component.css'
})
export class SettingsButtonComponent {

  constructor(private router: Router,
              private gameStateService: GameStateService) {
    this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
    });
  }

  wheelSpinning: boolean = false;

  goToSettings(): void {
    if (this.wheelSpinning) {
      return;
    }
    this.router.navigate(['settings']);
  }
}
