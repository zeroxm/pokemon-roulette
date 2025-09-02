import { Component, OnInit } from '@angular/core';
import { LanguageSelectorComponent } from "../main-game/language-selector/language-selector.component";
import { TranslatePipe } from '@ngx-translate/core';
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";
import { DarkModeToggleComponent } from './dark-mode-toggle/dark-mode-toggle.component';
import { NgIconsModule } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SettingsService, GameSettings } from '../services/settings-service/settings.service';

@Component({
  selector: 'app-settings',
  imports: [
    DarkModeToggleComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    MainGameButtonComponent,
    NgIconsModule,
    CommonModule
],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  settings$!: Observable<GameSettings>;
    
  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings$ = this.settingsService.settings$;
  }

  onToggleVerbosity(): void {
    this.settingsService.toggleLessExplanations();
  }

  onToggleMuteAudio(): void {
    this.settingsService.toggleMuteAudio();
  }

  onToggleSkipShinyRolls(): void {
    this.settingsService.toggleSkipShinyRolls();
  }

}
