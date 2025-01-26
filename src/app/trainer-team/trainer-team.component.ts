import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PokemonItem } from '../interfaces/pokemon-item';
import { Observable } from 'rxjs';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { BadgesComponent } from "./badges/badges.component";
import { Badge } from '../interfaces/badge';

@Component({
  selector: 'app-trainer-team',
  imports: [CommonModule,
    NgbTooltipModule, BadgesComponent],
  templateUrl: './trainer-team.component.html',
  styleUrl: './trainer-team.component.css'
})
export class TrainerTeamComponent {
  @Input() trainer!: { sprite: string; }; 
  @Input() trainerTeam!: PokemonItem[];
  @Input() trainerBadges!: Badge[];

  darkMode!: Observable<boolean>; 

  constructor(private darkModeService: DarkModeService) {
    this.darkMode = this.darkModeService.darkMode$;
  }

  getSprite(pokemon: PokemonItem): string {
    if (pokemon.shiny) {
      return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
    }
    return pokemon.sprite?.front_default || 'place-holder-pixel.png';
  }
}
