import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { PokedexDetailModalComponent } from './pokedex-detail-modal.component';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokemonFormsService } from '../../services/pokemon-forms-service/pokemon-forms.service';
import { PokedexEntry } from '../../services/pokedex-service/pokedex.service';

describe('PokedexDetailModalComponent', () => {
  let component: PokedexDetailModalComponent;
  let fixture: ComponentFixture<PokedexDetailModalComponent>;
  let mockPokemonService: jasmine.SpyObj<PokemonService>;
  let mockFormsService: jasmine.SpyObj<PokemonFormsService>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  const seenEntry: PokedexEntry = { won: false, sprite: null };
  const shinyEntry: PokedexEntry = { won: true, sprite: null, shiny: true };

  beforeEach(async () => {
    mockPokemonService = jasmine.createSpyObj('PokemonService', ['getPokemonById']);
    mockFormsService = jasmine.createSpyObj('PokemonFormsService', ['getFormIds', 'getPokemonForms']);
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['dismiss', 'close']);

    mockPokemonService.getPokemonById.and.returnValue({
      pokemonId: 25,
      text: 'pokemon.pikachu',
      fillStyle: '#FFD700',
      weight: 1,
      sprite: null,
      shiny: false,
      power: 3
    });
    mockFormsService.getFormIds.and.returnValue([]);
    mockFormsService.getPokemonForms.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [
        PokedexDetailModalComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: DarkModeService, useValue: { darkMode$: of(false) } },
        { provide: PokemonService, useValue: mockPokemonService },
        { provide: PokemonFormsService, useValue: mockFormsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexDetailModalComponent);
    component = fixture.componentInstance;
    component.pokemonId = 25;
    component.entry = seenEntry;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // artworkUrl getter
  it('artworkUrl returns regular URL when showShiny is false', () => {
    component.showShiny = false;
    expect(component.artworkUrl).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });

  it('artworkUrl returns shiny URL when showShiny is true', () => {
    component.showShiny = true;
    expect(component.artworkUrl).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png'
    );
  });

  it('artworkUrl uses selectedFormId when a form is selected', () => {
    component.selectedFormId = 10001;
    expect(component.artworkUrl).toContain('10001');
  });

  // displayUrl / fallback
  it('displayUrl returns artworkUrl when hasError is false', () => {
    component.hasError = false;
    expect(component.displayUrl).toBe(component.artworkUrl);
  });

  it('displayUrl returns fallbackUrl when hasError is true', () => {
    component.hasError = true;
    expect(component.displayUrl).toBe(component.fallbackUrl);
  });

  // formatPokemonNumber
  it('formatPokemonNumber pads IDs under 1000', () => {
    expect(component.formatPokemonNumber(25)).toBe('#025');
  });

  it('formatPokemonNumber does not pad IDs 1000+', () => {
    expect(component.formatPokemonNumber(1011)).toBe('#1011');
  });

  // hasShinyToggle
  it('hasShinyToggle is false when entry.shiny is undefined', () => {
    component.entry = seenEntry;
    expect(component.hasShinyToggle).toBeFalse();
  });

  it('hasShinyToggle is true when entry.shiny === true', () => {
    component.entry = shinyEntry;
    expect(component.hasShinyToggle).toBeTrue();
  });

  // template shiny toggle
  it('template does NOT render shiny toggle when entry.shiny is falsy', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.btn-outline-warning, .btn-warning');
    expect(toggle).toBeNull();
  });

  it('template renders shiny toggle button when entry.shiny is true', () => {
    component.entry = shinyEntry;
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.btn-outline-warning, .btn-warning');
    expect(toggle).not.toBeNull();
  });

  // hasAlternateForms
  it('hasAlternateForms is true when getFormIds returns array length > 1', () => {
    mockFormsService.getFormIds.and.returnValue([386, 10001, 10002, 10003]);
    expect(component.hasAlternateForms).toBeTrue();
  });

  it('hasAlternateForms is false when getFormIds returns empty array', () => {
    mockFormsService.getFormIds.and.returnValue([]);
    expect(component.hasAlternateForms).toBeFalse();
  });

  it('alternateForms returns empty array when getPokemonById returns undefined', () => {
    mockPokemonService.getPokemonById.and.returnValue(undefined);
    expect(component.alternateForms).toEqual([]);
  });
});
