import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntry } from '../../services/pokedex-service/pokedex.service';

export interface PokedexEntryClickEvent {
  pokemonId: number;
  entry: PokedexEntry;
}

@Component({
  selector: 'app-pokedex-entry',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, TranslatePipe],
  templateUrl: './pokedex-entry.component.html',
  styleUrl: './pokedex-entry.component.css'
})
export class PokedexEntryComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry: PokedexEntry | undefined;
  @Output() entryClicked = new EventEmitter<PokedexEntryClickEvent>();

  darkMode!: Observable<boolean>;

  readonly unknownPngUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';

  constructor(
    private darkModeService: DarkModeService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.darkMode = this.darkModeService.darkMode$;
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
    return this.entry?.sprite ?? null;
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
