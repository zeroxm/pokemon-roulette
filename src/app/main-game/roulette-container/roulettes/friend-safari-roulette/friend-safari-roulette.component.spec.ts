import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { FriendSafariRouletteComponent } from './friend-safari-roulette.component';
import { friendSafariPokemon } from './friend-safari-pokemon';
import { pokemonTypeData, PokemonType } from '../../../../interfaces/pokemon-type';
import { nationalDexPokemon } from '../../../../services/pokemon-service/national-dex-pokemon';

describe('FriendSafariRouletteComponent', () => {
  let component: FriendSafariRouletteComponent;
  let fixture: ComponentFixture<FriendSafariRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendSafariRouletteComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendSafariRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers every type exactly once', () => {
    expect(component.types.length).toBe(18);
    expect(new Set(component.types.map(t => t.type)).size).toBe(18);
  });

  it('emits the type its slice stands for, not its position', () => {
    // Dispatch reads the slice's own `type`, so reordering the wheel cannot change what a spin means.
    for (const [index, item] of component.types.entries()) {
      const emitted: PokemonType[] = [];
      const subscription = component.typeSelectedEvent.subscribe(t => emitted.push(t));

      component.onItemSelected(index);
      subscription.unsubscribe();

      expect(emitted).toEqual([item.type]);
    }
  });

  it('gives every slice a colour and a translation key', () => {
    for (const item of component.types) {
      expect(item.text).toBe(`types.${item.type}`);
      expect(item.fillStyle).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('friendSafariPokemon', () => {
  const dexIds = new Set(nationalDexPokemon.map(p => p.pokemonId));

  it('covers all eighteen types', () => {
    expect(Object.keys(friendSafariPokemon).length).toBe(18);
    for (const { key } of pokemonTypeData) {
      expect(friendSafariPokemon[key].length)
        .withContext(`${key} would spin an empty wheel`)
        .toBeGreaterThan(0);
    }
  });

  it('lists only real National Dex ids', () => {
    for (const [type, ids] of Object.entries(friendSafariPokemon)) {
      for (const id of ids) {
        expect(dexIds.has(id)).withContext(`${type} lists unknown id ${id}`).toBeTrue();
      }
    }
  });

  it('does not repeat a species within one type', () => {
    for (const [type, ids] of Object.entries(friendSafariPokemon)) {
      expect(new Set(ids).size).withContext(`${type} has a duplicate`).toBe(ids.length);
    }
  });
});
