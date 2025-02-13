import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GenerationService } from '../../services/generation-service/generation.service';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { Observable, Subscription } from 'rxjs';
import { GenerationItem } from '../../interfaces/generation-item';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import Fireworks from 'fireworks-js';
// @ts-ignore
import domtoimage from 'dom-to-image-more'

@Component({
  selector: 'app-end-game',
  imports: [
    CommonModule,
    NgIconsModule
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

  darkMode!: Observable<boolean>;

  @ViewChild('fireworksContainer', { static: false }) fireworksContainer!: ElementRef;
  @ViewChild('captureArea', { static: false }) captureArea!: ElementRef;

  generation!: GenerationItem;
  trainer!: { sprite: string; };
  trainerTeam!: PokemonItem[];

  private fireworks: Fireworks | null = null;
  private generationSubscription: Subscription | null = null;
  private trainerSubscription!: Subscription;
  private teamSubscription!: Subscription;  


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
    this.darkMode = this.darkModeService.darkMode$;
  }

  ngAfterViewInit() {
    console.debug('ngAfterViewInit');
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

    const scale = 2; // Adjust scale (2x, 3x, etc.)

    domtoimage.toBlob(this.captureArea.nativeElement, {
      width: this.captureArea.nativeElement.scrollWidth * scale,
      height: this.captureArea.nativeElement.scrollHeight * scale,
      style: {
        backgroundColor: this.darkMode ? 'rgba(45, 52, 54, 1);' : "rgba(223, 230, 233, 1)",
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${this.captureArea.nativeElement.scrollWidth * scale}px`,
        height: `${this.captureArea.nativeElement.scrollHeight * scale}px`
      }
    }).then((blob: Blob) => {
      const file = new File([blob], 'share.png', { type: 'image/png' });
    
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Check this out!',
          text: 'Look at my achievement!',
        });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'share.png';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }).catch((error: Error) => {
      console.error('Error capturing image:', error);
    });
  }

  showHistory() {

  }
}
