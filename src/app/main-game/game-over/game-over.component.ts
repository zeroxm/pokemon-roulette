import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { Subscription } from 'rxjs';
// @ts-ignore
import domtoimage from 'dom-to-image-more'
import { GenerationItem } from '../../interfaces/generation-item';
import { GenerationService } from '../../services/generation-service/generation.service';
import { GymLeader } from '../../interfaces/gym-leader';
import { gymLeadersByGeneration } from '../roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation'; 
import { eliteFourByGeneration } from '../roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation';
import { championByGeneration } from '../roulette-container/roulettes/champion-battle-roulette/champion-by-generation';
import { RestartGameButtonComponent } from "../../restart-game-buttom/restart-game-buttom.component";
import {TranslatePipe} from '@ngx-translate/core';
@Component({
  selector: 'app-game-over',
  imports: [
    CommonModule,
    NgIconsModule,
    RestartGameButtonComponent,
    TranslatePipe
  ],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css'
})
export class GameOverComponent implements OnInit, OnDestroy {

  constructor(
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private darkModeService: DarkModeService
  ) { }

  gymLeadersByGeneration = gymLeadersByGeneration;
  eliteFourByGeneration = eliteFourByGeneration;
  championByGeneration = championByGeneration;

  darkMode!: boolean;

  @ViewChild('captureArea', { static: false }) captureArea!: ElementRef;

  generation!: GenerationItem;
  trainer!: { sprite: string; };
  trainerTeam!: PokemonItem[];
  currentLeader: GymLeader | null = null;
  @Input() currentRound!: number;
  @Output() restartEvent = new EventEmitter<boolean>();

  private generationSubscription!: Subscription;
  private trainerSubscription!: Subscription;
  private teamSubscription!: Subscription;
  private darkModeSubscription!: Subscription;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });
    this.trainerSubscription = this.trainerService.getTrainer().subscribe(trainer => {
      this.trainer = trainer;
    });
    this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
      this.trainerTeam = team;
    });
    this.darkModeSubscription = this.darkModeService.darkMode$.subscribe(dark => {
      this.darkMode = dark;
    });

    this.currentLeader = this.getCurrentLeader();
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
    this.trainerSubscription?.unsubscribe();
    this.teamSubscription?.unsubscribe();
    this.darkModeSubscription?.unsubscribe();
  }

  resetGameAction(): void {
    this.restartEvent.emit(true);
  }

  getPokemonSprite(pokemon: PokemonItem): string {
    if (!pokemon) {
      return 'place-holder-pixel.png';
    }
    if (pokemon.shiny) {
      return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
    }
    return pokemon.sprite?.front_default || 'place-holder-pixel.png';
  }

  getPokemonColor(pokemon: PokemonItem): string {
    if (!pokemon) {
      return '';
    }

    return pokemon.fillStyle;
  }

  async shareResults() {
    if (!this.captureArea) return;

    const element = this.captureArea.nativeElement;
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = this.darkMode ? 'rgb(223, 230, 233)' : 'rgb(45, 52, 54)';
    const scale = 2;

    domtoimage.toBlob(this.captureArea.nativeElement, {
      width: this.captureArea.nativeElement.scrollWidth * scale,
      height: this.captureArea.nativeElement.scrollHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${this.captureArea.nativeElement.scrollWidth * scale}px`,
        height: `${this.captureArea.nativeElement.scrollHeight * scale}px`
      }
    }).then((blob: Blob) => {
      const file = new File([blob], 'run-is-over.png', { type: 'image/png' });
      element.style.backgroundColor = originalBg;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My progress',
          text: 'See how far I\'ve gone!',
        });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'run-is-over.png';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }).catch((error: Error) => {
      console.error('Error capturing image:', error);
    });
  }

  private getCurrentLeader(): GymLeader {

    let currentLeader = null

    if (this.currentRound < 8) {
      currentLeader = this.gymLeadersByGeneration[this.generation.id][this.currentRound];
    } else if (this.currentRound < 12) {
      currentLeader = this.eliteFourByGeneration[this.generation.id][this.currentRound%4];
    } else {
      currentLeader = this.championByGeneration[this.generation.id][0];
    }

    return currentLeader;
  }
}
