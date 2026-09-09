import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme-service/theme.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntry, pokemonSpriteUrl } from '../../services/pokedex-service/pokedex.service';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

export interface PokedexEntryClickEvent {
  pokemonId: number;
  entry: PokedexEntry;
}

@Component({
  selector: 'app-pokedex-entry',
  standalone: true,
  imports: [
    ImageFallbackDirective,CommonModule, NgbTooltipModule, TranslatePipe],
  templateUrl: './pokedex-entry.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pokedex-entry.component.css'
})
export class PokedexEntryComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry: PokedexEntry | undefined;
  @Output() entryClicked = new EventEmitter<PokedexEntryClickEvent>();

  darkMode!: Observable<boolean>;

  readonly unknownPngUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';

  constructor(
    private themeService: ThemeService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.darkMode = this.themeService.isDark$;
  }

  get isSeen(): boolean {
    return !!this.entry;
  }

  get isWon(): boolean {
    return this.entry?.won === true;
  }

  get pokemonText(): string {
    return this.pokemonService.getPokemonById(this.pokemonId)?.text ?? 'pokemon.unknown';
  }

  get spriteUrl(): string | null {
    // Derived from the id: the URL is no longer stored, because a thousand
    // copies of the same host is most of what a saved Pokédex used to weigh.
    return this.entry ? pokemonSpriteUrl(this.pokemonId) : null;
  }

  /** Times caught. Shown only once it is worth showing. */
  get catchCount(): number {
    return this.entry?.count ?? 0;
  }

  get showsCatchCount(): boolean {
    return this.catchCount > 1;
  }

  onCellClick(): void {
    if (!this.isSeen) return;
    this.entryClicked.emit({ pokemonId: this.pokemonId, entry: this.entry! });
  }

  formatPokemonNumber(id: number): string {
    if (id >= 1000) return `#${id}`;
    return `#${id.toString().padStart(3, '0')}`;
  }
}
