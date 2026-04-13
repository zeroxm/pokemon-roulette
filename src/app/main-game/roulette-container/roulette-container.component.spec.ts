import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  bootstrapArrowRepeat,
  bootstrapBook,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
} from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { GameStateService } from '../../services/game-state-service/game-state.service';
import { PokedexService } from '../../services/pokedex-service/pokedex.service';

import { RouletteContainerComponent } from './roulette-container.component';

describe('RouletteContainerComponent', () => {
  let component: RouletteContainerComponent;
  let fixture: ComponentFixture<RouletteContainerComponent>;
  let pokemonService: PokemonService;
  let trainerService: TrainerService;
  let gameStateService: GameStateService;
  let pokedexService: PokedexService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteContainerComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({
          bootstrapArrowRepeat,
          bootstrapBook,
          bootstrapCheck,
          bootstrapClock,
          bootstrapController,
          bootstrapCupHotFill,
          bootstrapGear,
          bootstrapMap,
          bootstrapPcDisplayHorizontal,
          bootstrapPeopleFill,
          bootstrapShare,
        }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteContainerComponent);
    component = fixture.componentInstance;
    pokemonService = TestBed.inject(PokemonService);
    trainerService = TestBed.inject(TrainerService);
    gameStateService = TestBed.inject(GameStateService);
    pokedexService = TestBed.inject(PokedexService);
    gameStateService.resetGameState();
    trainerService.resetTeam();
    localStorage.clear();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route to form selection when captured pokemon has multiple forms', () => {
    const deoxys = pokemonService.getPokemonById(386);
    expect(deoxys).toBeDefined();

    component.capturePokemon(deoxys!);

    expect(component.getGameState()).toBe('select-form');
    expect(component.pokemonForms.map(form => form.pokemonId)).toEqual([386, 10001, 10002, 10003]);
    expect(trainerService.getTeam().length).toBe(0);
  });

  it('should capture immediately when pokemon has no forms', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    component.capturePokemon(bulbasaur!);

    expect(component.getGameState()).toBe('check-shininess');
    expect(trainerService.getTeam().length).toBe(1);
    expect(trainerService.getTeam()[0].pokemonId).toBe(1);
  });

  it('should register base national dex ID in Pokédex when alt form is selected — ALT-FORM-01', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();
    component.capturePokemon(raichu!);

    // Select Alolan Raichu form (pokemonId 10100)
    const forms = component.pokemonForms;
    const alolanRaichu = forms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Base national dex entry (26) should be registered
    expect(pokedexService.currentPokedex.caught['26']).toBeTruthy();
  });

  // ALT-FORM-02: shiny alt form propagates shiny flag to base national dex entry
  it('should propagate shiny flag to base national dex entry when shiny alt form captured — ALT-FORM-02', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();
    const shinyRaichu = { ...raichu!, shiny: true };
    component.capturePokemon(shinyRaichu);

    const forms = component.pokemonForms;
    const alolanRaichu = forms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Base entry should have shiny: true
    expect(pokedexService.currentPokedex.caught['26']?.shiny).toBeTrue();
  });

  // SHINY-03: shiny flag must be persisted to Pokédex after shiny roulette
  it('should update Pokédex entry with shiny: true after setShininess(true) — SHINY-03', () => {
    const bulbasaur = pokemonService.getPokemonById(1);
    expect(bulbasaur).toBeDefined();

    // Capture Bulbasaur (no forms → goes straight to check-shininess)
    component.capturePokemon(bulbasaur!);

    // Simulate shiny roulette resolving to shiny
    component.setShininess(true);

    expect(pokedexService.currentPokedex.caught['1']?.shiny).toBeTrue();
  });

  it('should mark base national dex ID as won after Champion win with alt-form on team — ALTW-01', () => {
    const raichu = pokemonService.getPokemonById(26);
    expect(raichu).toBeDefined();

    // Capture Raichu → triggers form selection
    component.capturePokemon(raichu!);

    // Select Alolan Raichu form (pokemonId 10100) — adds alt-form to team
    const alolanRaichu = component.pokemonForms.find(f => f.pokemonId === 10100);
    expect(alolanRaichu).toBeDefined();
    component.selectPokemonForm(alolanRaichu!);

    // Beat the Champion
    component.championBattleResult(true);

    // Base national dex entry (26 = Raichu) must be marked won
    expect(pokedexService.currentPokedex.caught['26']?.won).toBeTrue();
  });
});
