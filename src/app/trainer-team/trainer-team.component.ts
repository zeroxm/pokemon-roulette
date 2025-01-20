import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PokemonItem } from '../main-game/main-game.component';

@Component({
  selector: 'app-trainer-team',
  imports: [CommonModule],
  templateUrl: './trainer-team.component.html',
  styleUrl: './trainer-team.component.css'
})
export class TrainerTeamComponent {
  @Input() trainer!: { sprite: string; }; 
  @Input() team!: PokemonItem[];
}
