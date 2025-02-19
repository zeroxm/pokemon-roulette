import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-main-game-button',
  imports: [
    NgIconsModule
  ],
  templateUrl: './main-game-button.component.html',
  styleUrl: './main-game-button.component.css'
})
export class MainGameButtonComponent {

  constructor(private router: Router) {}

  goToMainGame(): void {
    this.router.navigate(['']);
  }
}
