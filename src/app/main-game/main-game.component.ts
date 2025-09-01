import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { ItemItem } from '../interfaces/item-item';
import { RestartGameComponent } from "../restart-game/restart-game.component";
import { TrainerService } from '../services/trainer-service/trainer.service';
import { AnalyticsService } from '../services/analytics-service/analytics.service';
import { CreditsButtonComponent } from "./credits-button/credits-button.component";
import { CoffeeButtonComponent } from "./coffee-button/coffee-button.component";
import { NgIconsModule } from '@ng-icons/core';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { TranslatePipe } from '@ngx-translate/core';
import { RouletteContainerComponent } from './roulette-container/roulette-container.component';

@Component({
  selector: 'app-main-game',
  imports: [
    CommonModule,
    RouletteContainerComponent,
    DarkModeToggleComponent,
    TrainerTeamComponent,
    ItemsComponent,
    RestartGameComponent,
    CreditsButtonComponent,
    CoffeeButtonComponent,
    NgIconsModule,
    NgbCollapseModule,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
export class MainGameComponent implements OnInit {

  constructor(
    private darkModeService: DarkModeService,
    private gameStateService: GameStateService,
    private trainerService: TrainerService,
    private modalService: NgbModal,
    private analyticsService: AnalyticsService) {
      this.darkMode = this.darkModeService.darkMode$;
  }

  wheelSpinning: boolean = false;

  ngOnInit(): void {
    this.analyticsService.trackEvent('main-game-loaded', 'Main Game Loaded', 'user acess');

    this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
    });
  }
  
  darkMode!: Observable<boolean>;
  mapIsCollapsed: boolean = true;
  lessExplanations: boolean = false;

  
  toggleLessExplanations(): void {
    this.lessExplanations = !this.lessExplanations;
  }

  resetGameAction(): void {
    this.resetGame();
    this.modalService.dismissAll();
  }

  rareCandyInterrupt(rareCandy: ItemItem): void {
    if(this.wheelSpinning){
      return;
    }

    // this.auxPokemonList = this.trainerService.getPokemonThatCanEvolve();

    // if (this.auxPokemonList.length !== 0) {
    //   this.gameStateService.repeatCurrentState();
    //   this.trainerService.removeItem(rareCandy);
    //   this.currentContextItem = rareCandy;
    //   this.chooseWhoWillEvolve('rare-candy');
    // }
  }

  private resetGame(): void {
    this.trainerService.resetTrainer();
    this.trainerService.resetTeam();
    this.trainerService.resetItems();
    this.trainerService.resetBadges();
    //this.evolutionCredits = 0;
    this.gameStateService.resetGameState();
  }
}
