import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { GameStateService } from '../../services/game-state-service/game-state.service';

@Component({
  selector: 'app-coffee-button',
  imports: [
    NgIconsModule
  ],
  templateUrl: './coffee-button.component.html',
  styleUrl: './coffee-button.component.css'
})
export class CoffeeButtonComponent {

  constructor(private router: Router,
              private gameStateService: GameStateService) {
    this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
    });
  }

  wheelSpinning: boolean = false;

  goToCoffee(): void {
    if (this.wheelSpinning) {
      return;
    }
    this.router.navigate(['coffee']);
  }
}
