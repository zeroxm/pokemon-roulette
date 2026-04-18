import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIconsModule } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../services/theme-service/theme.service';
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
              private darkModeService: DarkModeService,
              private themeService: ThemeService) {
      this.gameStateService.wheelSpinningObserver.pipe(takeUntilDestroyed()).subscribe(state => {
      this.wheelSpinning = state;
    });

    this.darkMode = this.themeService.isDark$;
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
