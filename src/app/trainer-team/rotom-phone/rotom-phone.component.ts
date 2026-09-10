import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme-service/theme.service';
import { PokedexComponent } from '../pokedex/pokedex.component';
import { BadgeDexComponent } from '../badge-dex/badge-dex.component';
import { AchievementsComponent } from '../achievements/achievements.component';

type PhoneApp = 'pokedex' | 'badges' | 'achievements';

/**
 * One button for everything the player has collected.
 *
 * The Pokédex, the trophy case and the achievements were three buttons in a
 * row that only ever grew, next to the PC. They are the same kind of thing —
 * a record of what you have done — so they belong behind one door, and the
 * row is now the two it should always have been: storage on the left, this on
 * the right.
 *
 * Named for the Rotom Phone, which in Sword and Shield is exactly this: one
 * device holding the Pokédex and everything adjacent to it.
 */
@Component({
  selector: 'app-rotom-phone',
  imports: [CommonModule, NgIconsModule, TranslatePipe, PokedexComponent, BadgeDexComponent, AchievementsComponent],
  templateUrl: './rotom-phone.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './rotom-phone.component.css',
})
export class RotomPhoneComponent {

  constructor(
    private themeService: ThemeService,
    private modalService: NgbModal,
  ) {
    this.darkMode = this.themeService.isDark$;
  }

  // static: true, or the first click finds an undefined ref — the same reason
  // the three panels this replaced each said so.
  @ViewChild('phoneModal', { static: true }) phoneModal!: TemplateRef<unknown>;

  // Assigned in the constructor body, not as a field initialiser: those run
  // before constructor parameter properties exist, and this codebase has been
  // bitten by that before.
  readonly darkMode: Observable<boolean>;

  /** The Pokédex is what people open this for. */
  app: PhoneApp = 'pokedex';

  open(): void {
    this.app = 'pokedex';
    this.modalService.open(this.phoneModal, { centered: true, size: 'lg', scrollable: true });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}
