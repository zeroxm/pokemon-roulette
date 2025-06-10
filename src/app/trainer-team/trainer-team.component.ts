import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PokemonItem } from '../interfaces/pokemon-item';
import { Observable, Subscription } from 'rxjs';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { BadgesComponent } from "./badges/badges.component";
import { Badge } from '../interfaces/badge';
import { TrainerService } from '../services/trainer-service/trainer.service';
import { StoragePcComponent } from "./storage-pc/storage-pc.component";
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-trainer-team',
  imports: [CommonModule,
    NgbTooltipModule,
    BadgesComponent,
    StoragePcComponent, TranslatePipe],
  templateUrl: './trainer-team.component.html',
  styleUrls: ['./trainer-team.component.css']
})
export class TrainerTeamComponent implements OnInit, OnDestroy {

  constructor(private trainerService: TrainerService,
              private darkModeService: DarkModeService) { }

  trainer!: { sprite: string; };
  trainerTeam!: PokemonItem[];
  trainerBadges!: Badge[];

  darkMode!: Observable<boolean>;

  private trainerSubscription!: Subscription;
  private teamSubscription!: Subscription;
  private badgesSubscription!: Subscription;

  ngOnInit(): void {
    this.trainerSubscription = this.trainerService.getTrainer().subscribe(trainer => {
      this.trainer = trainer;
    });
    this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
      this.trainerTeam = team;
    });
    this.badgesSubscription = this.trainerService.getBadgesObservable().subscribe(badges => {
      this.trainerBadges = badges;
    });
    this.darkMode = this.darkModeService.darkMode$;
  }

  ngOnDestroy(): void {
    this.trainerSubscription?.unsubscribe();
    this.teamSubscription?.unsubscribe();
    this.badgesSubscription?.unsubscribe();
  }

  getSprite(pokemon: PokemonItem): string {
    if (pokemon.shiny) {
      return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
    }
    return pokemon.sprite?.front_default || 'place-holder-pixel.png';
  }
}
