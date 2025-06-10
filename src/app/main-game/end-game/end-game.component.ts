import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GenerationService } from '../../services/generation-service/generation.service';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { Subscription } from 'rxjs';
import { GenerationItem } from '../../interfaces/generation-item';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import Fireworks from 'fireworks-js';
// @ts-ignore
import domtoimage from 'dom-to-image-more'
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-end-game',
  imports: [
    CommonModule,
    NgIconsModule,
    TranslatePipe
  ],
  templateUrl: './end-game.component.html',
  styleUrl: './end-game.component.css'
})
export class EndGameComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private generationService: GenerationService,
    private trainerService: TrainerService,
    private darkModeService: DarkModeService
  ) { }

  darkMode!: boolean;

  @ViewChild('fireworksContainer', { static: false }) fireworksContainer!: ElementRef;
  @ViewChild('captureArea', { static: false }) captureArea!: ElementRef;

  generation!: GenerationItem;
  trainer!: { sprite: string; };
  trainerTeam!: PokemonItem[];

  private fireworks: Fireworks | null = null;
  private generationSubscription: Subscription | null = null;
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
  }

  ngAfterViewInit() {
    const container = this.fireworksContainer.nativeElement;
    this.fireworks = new Fireworks(container, {
      autoresize: false,
      particles: 120
    });

    this.fireworks.start();
  }

  ngOnDestroy(): void {
    this.fireworks?.stop();
    this.generationSubscription?.unsubscribe();
    this.trainerSubscription?.unsubscribe();
    this.teamSubscription?.unsubscribe();
    this.darkModeSubscription?.unsubscribe();
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
      const file = new File([blob], this.generation.region+'-champion.png', { type: 'image/png' });
      element.style.backgroundColor = originalBg;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Pokemon Champion of '+this.generation.region,
          text: 'Look what I got!',
        });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.generation.region+'-champion.png';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }).catch((error: Error) => {
      console.error('Error capturing image:', error);
    });
  }
}
