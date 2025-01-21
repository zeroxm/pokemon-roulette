import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PokemonItem } from '../interfaces/pokemon-item';

@Component({
  selector: 'app-trainer-team',
  imports: [CommonModule],
  templateUrl: './trainer-team.component.html',
  styleUrl: './trainer-team.component.css'
})
export class TrainerTeamComponent {
  @Input() trainer!: { sprite: string; }; 
  @Input() team!: PokemonItem[];

  getSprite(pokemon: PokemonItem): string {
    if (pokemon.shiny) {
      return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
    }
    return pokemon.sprite?.front_default || 'place-holder-pixel.png';
  }
}
