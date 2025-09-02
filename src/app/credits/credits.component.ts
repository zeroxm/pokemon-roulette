import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";
import {TranslatePipe} from '@ngx-translate/core';
import { CoffeeButtonComponent } from "../main-game/coffee-button/coffee-button.component";

@Component({
  selector: 'app-credits',
  imports: [
    CommonModule,
    MainGameButtonComponent,
    TranslatePipe,
    CoffeeButtonComponent
],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.css'
})
export class CreditsComponent {

}
