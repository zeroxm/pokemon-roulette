import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../../services/theme-service/theme.service';
import { PokedexService, PokedexData } from '../../services/pokedex-service/pokedex.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntryComponent } from '../../pokedex/pokedex-entry/pokedex-entry.component';
import { PokedexDetailModalComponent } from '../../pokedex/pokedex-detail-modal/pokedex-detail-modal.component';
import { PokedexEntryClickEvent } from '../../pokedex/pokedex-entry/pokedex-entry.component';
import { pokedexByGeneration } from '../../pokedex/pokedex-by-generation';

@Component({
  selector: 'app-pokedex',
  imports: [CommonModule, NgIconsModule, TranslatePipe, PokedexEntryComponent],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.css'
})
export class PokedexComponent implements OnInit, OnDestroy {

  constructor(
    private darkModeService: DarkModeService,
    private themeService: ThemeService,
    private modalService: NgbModal,
    private pokedexService: PokedexService,
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) {}

  // Omitting static: true causes openPokedex() to fail with undefined ref on first click
  @ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;

  darkMode!: Observable<boolean>;
  pokedexData: PokedexData | undefined;
  currentGenerationId: number = 1;
  currentRegion: string = 'Kanto';
  activeTab: 'local' | 'national' = 'local';

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.themeService.isDark$;
    this.subscriptions.add(
      this.pokedexService.pokedex$.subscribe(data => {
        this.pokedexData = data;
      })
    );
    this.subscriptions.add(
      this.generationService.getGeneration().subscribe(gen => {
        this.currentGenerationId = gen.id;
        this.currentRegion = gen.region;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openPokedex(): void {
    this.activeTab = 'local';  // per D-03: Local Dex active by default on open
    this.modalService.open(this.pokedexModal, {
      centered: true,
      size: 'lg'
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  onEntryClicked(event: PokedexEntryClickEvent): void {
    const modalRef = this.modalService.open(PokedexDetailModalComponent, {
      centered: true,
      size: 'md'
    });
    modalRef.componentInstance.pokemonId = event.pokemonId;
    modalRef.componentInstance.entry = event.entry;
  }

  get localIds(): number[] {
    return pokedexByGeneration[this.currentGenerationId] ?? [];
  }

  get nationalIds(): number[] {
    return this.pokemonService.nationalDexPokemon.map(p => p.pokemonId);
  }

  get activeIds(): number[] {
    return this.activeTab === 'local' ? this.localIds : this.nationalIds;
  }

  get caughtCount(): number {
    const data = this.pokedexData;
    if (!data) return 0;
    // pokedexData.caught[id] with numeric id NEVER matches — always returns undefined
    return this.activeIds.filter(id => !!data.caught[String(id)]).length;
  }

  get totalCount(): number {
    return this.activeIds.length;
  }
}
