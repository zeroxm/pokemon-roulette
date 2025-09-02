import { Component } from '@angular/core';
import { LanguageSelectorComponent } from "../main-game/language-selector/language-selector.component";
import { TranslatePipe } from '@ngx-translate/core';
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";
import { DarkModeToggleComponent } from './dark-mode-toggle/dark-mode-toggle.component';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-settings',
  imports: [
    DarkModeToggleComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    MainGameButtonComponent,
    NgIconsModule
],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  lessExplanations: boolean = false;
    
  onToggleVerbosity(): void {
    this.lessExplanations = !this.lessExplanations;
  }

}
