import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokedexService, PokedexData } from '../../services/pokedex-service/pokedex.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntryComponent } from '../../pokedex/pokedex-entry/pokedex-entry.component';
import { pokemonByGeneration } from '../../main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation';

@Component({
  selector: 'app-pokedex',
  imports: [CommonModule, NgIconsModule, TranslatePipe, PokedexEntryComponent],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.css'
})
export class PokedexComponent implements OnInit, OnDestroy {

  constructor(
    private darkModeService: DarkModeService,
    private modalService: NgbModal,
    private pokedexService: PokedexService,
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) {}

  // ⚠️ CRITICAL: static: true is MANDATORY — template ref must be available in ngOnInit
  // Omitting static: true causes openPokedex() to fail with undefined ref on first click
  @ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;

  darkMode!: Observable<boolean>;
  pokedexData!: PokedexData;
  currentGenerationId: number = 1;
  activeTab: 'local' | 'national' = 'local';

  // ⚠️ Follow StoragePcComponent subscription pattern exactly (per D-09)
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.darkModeService.darkMode$;
    this.subscriptions.add(
      this.pokedexService.pokedex$.subscribe(data => {
        this.pokedexData = data;
      })
    );
    this.subscriptions.add(
      this.generationService.getGeneration().subscribe(gen => {
        this.currentGenerationId = gen.id;
      })
    );
  }

  ngOnDestroy(): void {
    // ⚠️ MANDATORY: prevents memory leaks — mirrors StoragePcComponent exactly
    this.subscriptions.unsubscribe();
  }

  openPokedex(): void {
    this.activeTab = 'local';  // per D-03: Local Dex active by default on open
    this.modalService.open(this.pokedexModal, {
      centered: true,
      size: 'lg',
      // ⚠️ NAV-04: use windowClass NOT size — size expects Bootstrap keywords (sm/md/lg/xl)
      // windowClass passes Bootstrap class directly to modal DOM element
      windowClass: 'modal-fullscreen-sm-down'
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  get localIds(): number[] {
    // ⚠️ Use nullish coalescing — currentGenerationId may be 0/undefined during init
    return pokemonByGeneration[this.currentGenerationId] ?? [];
  }

  get nationalIds(): number[] {
    return this.pokemonService.nationalDexPokemon.map(p => p.pokemonId);
  }

  get activeIds(): number[] {
    return this.activeTab === 'local' ? this.localIds : this.nationalIds;
  }

  get caughtCount(): number {
    if (!this.pokedexData) return 0;
    // ⚠️ NAV-03: String(id) is MANDATORY — caught Record uses string keys (service stores as String(pokemonId))
    // pokedexData.caught[id] with numeric id NEVER matches — always returns undefined
    return this.activeIds.filter(id => !!this.pokedexData.caught[String(id)]).length;
  }

  get totalCount(): number {
    return this.activeIds.length;
  }
}
