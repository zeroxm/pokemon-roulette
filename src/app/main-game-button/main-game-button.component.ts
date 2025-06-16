import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-main-game-button',
  imports: [
    NgIconsModule,
    TranslatePipe
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
