import { Component } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";

@Component({
  selector: 'app-coffee',
  imports: [
    NgIconsModule,
    DarkModeToggleComponent,
    MainGameButtonComponent
],
  templateUrl: './coffee.component.html',
  styleUrl: './coffee.component.css'
})
export class CoffeeComponent {

}
