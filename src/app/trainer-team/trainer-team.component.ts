import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { PokemonItem } from '../interfaces/pokemon-item';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from '../services/theme-service/theme.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { BadgesComponent } from "./badges/badges.component";
import { Badge } from '../interfaces/badge';
import { TrainerService } from '../services/trainer-service/trainer.service';
import { StoragePcComponent } from "./storage-pc/storage-pc.component";
import { RotomPhoneComponent } from "./rotom-phone/rotom-phone.component";
import { AccountStatusComponent } from "../account/account-status/account-status.component";
import {TranslatePipe} from '@ngx-translate/core';
import { ImageFallbackDirective } from '../directives/image-fallback.directive';
import { MegaStoneActivation } from '../services/mega-stone-service/mega-stone.service';

@Component({
  selector: 'app-trainer-team',
  imports: [
    ImageFallbackDirective,CommonModule,
    NgbTooltipModule,
    BadgesComponent,
    StoragePcComponent,
    RotomPhoneComponent,
    AccountStatusComponent,
    TranslatePipe,
  ],
  templateUrl: './trainer-team.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./trainer-team.component.css']
})
export class TrainerTeamComponent implements OnInit, OnDestroy {

  constructor(private trainerService: TrainerService,
              private themeService: ThemeService) { }

  trainer!: { sprite: string; };
  trainerTeam!: PokemonItem[];
  trainerBadges!: Badge[];

  darkMode!: Observable<boolean>;
  @Output() megaStoneInterrupt = new EventEmitter<MegaStoneActivation>();

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
    this.darkMode = this.themeService.isDark$;
  }

  ngOnDestroy(): void {
    this.trainerSubscription?.unsubscribe();
    this.teamSubscription?.unsubscribe();
    this.badgesSubscription?.unsubscribe();
  }

  /**
   * Whether this Pokemon is the one Dynamaxed for the current battle.
   *
   * Reference identity, not species: two of the same Pokemon on a team are the same species, and
   * only the lead is Dynamaxed. A Gigantamax already looks different because its sprite changed,
   * so this is what makes a *plain* Dynamax visible at all.
   */
  isMaxed(pokemon: PokemonItem | undefined): boolean {
    const maxState = this.trainerService.getMaxState();
    return !!pokemon && !!maxState && maxState.pokemon === pokemon;
  }

  getSprite(pokemon: PokemonItem): string {
    if (pokemon.shiny) {
      return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
    }
    return pokemon.sprite?.front_default || 'place-holder-pixel.png';
  }

  getMegaStoneSprite(pokemon: PokemonItem | undefined): string | null {
    return this.getHeldMegaStoneItem(pokemon)?.sprite || null;
  }

  getMegaStoneTextKey(pokemon: PokemonItem | undefined): string | null {
    return this.getHeldMegaStoneItem(pokemon)?.text || null;
  }

  getMegaStoneFillStyle(pokemon: PokemonItem | undefined): string {
    return this.getHeldMegaStoneItem(pokemon)?.fillStyle ?? 'rgba(255, 255, 255, 0.9)';
  }

  triggerMegaStoneInterrupt(pokemon: PokemonItem | undefined): void {
    const megaStone = this.getHeldMegaStoneItem(pokemon);
    if (!megaStone) {
      return;
    }

    this.megaStoneInterrupt.emit({ stone: megaStone, pokemon });
  }

  private getHeldMegaStoneItem(pokemon: PokemonItem | undefined) {
    if (!pokemon) {
      return null;
    }

    const heldStoneName = this.trainerService.getHeldMegaStoneNamesForPokemon(pokemon)[0];
    if (!heldStoneName) {
      return null;
    }

    return this.trainerService.getItem(heldStoneName) ?? null;
  }
}
