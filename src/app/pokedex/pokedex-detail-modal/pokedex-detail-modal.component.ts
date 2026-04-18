import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../../services/theme-service/theme.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokemonFormsService } from '../../services/pokemon-forms-service/pokemon-forms.service';
import { PokedexEntry } from '../../services/pokedex-service/pokedex.service';
import { PokemonForm } from '../../interfaces/pokemon-form';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonType, pokemonTypeDataByKey } from '../../interfaces/pokemon-type';

@Component({
  selector: 'app-pokedex-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './pokedex-detail-modal.component.html',
  styleUrl: './pokedex-detail-modal.component.css'
})
export class PokedexDetailModalComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry!: PokedexEntry;

  showShiny = false;
  selectedFormId!: number;
  darkMode!: Observable<boolean>;
  hasError = false;

  readonly fallbackUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';
  private readonly typeIconBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

  constructor(
    public activeModal: NgbActiveModal,
    private pokemonService: PokemonService,
    private pokemonFormsService: PokemonFormsService,
    private darkModeService: DarkModeService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.selectedFormId = this.pokemonId;
    this.darkMode = this.themeService.isDark$;
  }

  get artworkUrl(): string {
    const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
    return this.showShiny
      ? `${base}/shiny/${this.selectedFormId}.png`
      : `${base}/${this.selectedFormId}.png`;
  }

  get displayUrl(): string {
    return this.hasError ? this.fallbackUrl : this.artworkUrl;
  }

  get pokemonNameKey(): string {
    if (this.selectedFormId === this.pokemonId) {
      return this.pokemonService.getPokemonById(this.pokemonId)?.text ?? 'pokemon.unknown';
    }
    const form = this.alternateForms.find(f => f.pokemonId === this.selectedFormId);
    return form?.text ?? 'pokemon.unknown';
  }

  get selectedPokemon(): PokemonItem | undefined {
    return this.pokemonService.getPokemonById(this.selectedFormId);
  }

  get selectedForm(): PokemonForm | undefined {
    return this.alternateForms.find(form => form.pokemonId === this.selectedFormId);
  }

  get detailsNameKey(): string {
    return this.selectedPokemon?.text ?? this.selectedForm?.text ?? this.pokemonNameKey;
  }

  get detailsPower(): number {
    return this.selectedPokemon?.power ?? this.pokemonService.getPokemonById(this.pokemonId)?.power ?? 1;
  }

  get detailsTypes(): PokemonType[] {
    const type1 = this.selectedPokemon?.type1 ?? this.selectedForm?.type1;
    const type2 = this.selectedPokemon?.type2 ?? this.selectedForm?.type2;
    return [type1, type2].filter((type): type is PokemonType => !!type);
  }

  getTypeIconUrl(type: PokemonType): string {
    const typeData = pokemonTypeDataByKey[type];
    return `${this.typeIconBaseUrl}/${typeData.id}.png`;
  }

  get hasShinyToggle(): boolean {
    return this.entry?.shiny === true;
  }

  get hasAlternateForms(): boolean {
    return this.pokemonFormsService.getFormIds(this.pokemonId).length > 1;
  }

  get alternateForms(): PokemonForm[] {
    const base = this.pokemonService.getPokemonById(this.pokemonId);
    if (!base) return [];
    return this.pokemonFormsService.getPokemonForms(base);
  }

  formatPokemonNumber(id: number): string {
    if (id >= 1000) return `#${id}`;
    return `#${id.toString().padStart(3, '0')}`;
  }

  onArtworkError(): void {
    this.hasError = true;
  }

  selectForm(formId: number): void {
    this.selectedFormId = formId;
    this.hasError = false;
  }
}
