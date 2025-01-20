import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeToggleComponent } from "./dark-mode-toggle/dark-mode-toggle.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DarkModeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pokemon-roulette';
}
