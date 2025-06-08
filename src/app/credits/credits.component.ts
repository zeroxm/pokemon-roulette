import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-credits',
  imports: [
    CommonModule,
    DarkModeToggleComponent,
    MainGameButtonComponent,
    TranslatePipe
  ],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.css'
})
export class CreditsComponent {

}
