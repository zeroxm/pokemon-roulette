import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { of } from 'rxjs';

import { PokedexComponent } from './pokedex.component';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokedexService } from '../../services/pokedex-service/pokedex.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PokedexDetailModalComponent } from '../../pokedex/pokedex-detail-modal/pokedex-detail-modal.component';

describe('PokedexComponent', () => {
  let component: PokedexComponent;
  let fixture: ComponentFixture<PokedexComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let pokedexServiceSpy: jasmine.SpyObj<PokedexService>;
  let generationServiceSpy: jasmine.SpyObj<GenerationService>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;
  let darkModeServiceSpy: jasmine.SpyObj<DarkModeService>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    pokedexServiceSpy = jasmine.createSpyObj('PokedexService', [], {
      pokedex$: of({ caught: { '25': { won: true, sprite: 'url.png' } } })
    });
    generationServiceSpy = jasmine.createSpyObj('GenerationService', ['getGeneration']);
    generationServiceSpy.getGeneration.and.returnValue(
      of({ id: 1, text: 'Gen 1', region: 'Kanto', fillStyle: 'darkred', weight: 1 })
    );
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [], {
      nationalDexPokemon: [{ pokemonId: 1, text: 'pokemon.bulbasaur', fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 }]
    });
    darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', [], {
      darkMode$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [PokedexComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({ bootstrapBook }),
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: PokedexService, useValue: pokedexServiceSpy },
        { provide: GenerationService, useValue: generationServiceSpy },
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: DarkModeService, useValue: darkModeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('activeTab defaults to local', () => {
    expect(component.activeTab).toBe('local');
  });

  it('activeTab can be set to national', () => {
    component.activeTab = 'national';
    expect(component.activeTab).toBe('national');
  });

  it('NAV-03: totalCount is greater than 0 for local tab', () => {
    expect(component.totalCount).toBeGreaterThan(0);
  });

  it('NAV-03: caughtCount is 0 or more and not greater than totalCount', () => {
    expect(component.caughtCount).toBeGreaterThanOrEqual(0);
    expect(component.caughtCount).toBeLessThanOrEqual(component.totalCount);
  });

  it('NAV-04: openPokedex calls NgbModal.open with size lg', () => {
    component.openPokedex();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.objectContaining({ size: 'lg' })
    );
  });

  it('NAV-05: darkMode field is assigned after ngOnInit', () => {
    expect(component.darkMode).toBeTruthy();
  });

  it('DETAIL-01: onEntryClicked opens PokedexDetailModalComponent via modalService', () => {
    const mockModalRef = { componentInstance: {} as any };
    modalServiceSpy.open.and.returnValue(mockModalRef as any);
    const entry = { won: true, sprite: null };
    component.onEntryClicked({ pokemonId: 25, entry });
    expect(modalServiceSpy.open).toHaveBeenCalledWith(
      PokedexDetailModalComponent,
      jasmine.objectContaining({ size: 'md' })
    );
    expect(mockModalRef.componentInstance.pokemonId).toBe(25);
  });
});
