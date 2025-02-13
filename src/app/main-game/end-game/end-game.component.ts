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

  shareResults() {

  }

  showHistory() {

  }
}
