import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../../services/theme-service/theme.service';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import domtoimage from 'dom-to-image-more'
import { GenerationItem } from '../../interfaces/generation-item';
import { GenerationService } from '../../services/generation-service/generation.service';
import { GymLeader } from '../../interfaces/gym-leader';
import { gymLeadersByGeneration } from '../roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation'; 
import { eliteFourByGeneration } from '../roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation';
import { championByGeneration } from '../roulette-container/roulettes/champion-battle-roulette/champion-by-generation';
import { RestartGameButtonComponent } from "../../restart-game-button/restart-game-button.component";
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
    private darkModeService: DarkModeService,
    private themeService: ThemeService,
    private translate: TranslateService
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
    this.darkModeSubscription = this.themeService.isDark$.subscribe(dark => {
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
    
    // FIX 1: Abbassato a 1 per evitare l'esaurimento della RAM e il freeze del browser
    const scale = 1; 

    try {
      // Usiamo await invece dei .then() concatenati
      const blob = await domtoimage.toBlob(element, {
        width: element.scrollWidth * scale,
        height: element.scrollHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${element.scrollWidth * scale}px`,
          height: `${element.scrollHeight * scale}px`
        }
      });

      if (!blob) throw new Error("Impossibile generare l'immagine");

      const file = new File([blob], 'run-is-over.png', { type: 'image/png' });

      // Controlliamo se la Share API è supportata e valida
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          // FIX 2: Await su navigator.share per intercettare se l'utente annulla o se il browser blocca
          await navigator.share({
            files: [file],
            title: this.translate.instant('game.over.shareTitle'),
            text: this.translate.instant('game.over.shareText'),
          });
        } catch (shareError: any) {
          // Se l'utente chiude la finestra di condivisione o c'è un timeout, non facciamo crashare l'app
          console.warn('Condivisione annullata o fallita:', shareError);
        }
      } else {
        // Fallback al download classico
        this.downloadFallback(blob);
      }

    } catch (error) {
      console.error('Errore durante la cattura dell\'immagine:', error);
      // Se la generazione fallisce, forziamo il download come fallback o mostriamo un errore
      alert("Impossibile condividere l'immagine. Riprova.");
    } finally {
      // FIX 3: Il blocco finally viene eseguito SEMPRE, sia in caso di successo che di errore/freeze temporaneo.
      // Questo impedisce che l'interfaccia rimanga "bloccata" con il colore di cattura.
      element.style.backgroundColor = originalBg;
    }
  }

  // Funzione di supporto per il fallback
  private downloadFallback(blob: Blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'run-is-over.png';
    document.body.appendChild(link); // Necessario su alcuni browser prima del click
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
