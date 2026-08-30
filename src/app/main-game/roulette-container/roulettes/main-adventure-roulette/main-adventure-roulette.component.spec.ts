import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { GenerationService } from '../../../../services/generation-service/generation.service';

import { EventEmitter } from '@angular/core';

import { MainAdventureRouletteComponent } from './main-adventure-roulette.component';
import { ADVENTURE_ACTIONS, AdventureActionName } from './adventure-actions';

/**
 * The output each slice is expected to fire.
 *
 * A `Record` over the derived name union, so a new slice cannot be added without deciding what it
 * emits here too. Three names do not follow the `<name>Event` convention, which is exactly the kind
 * of thing an index-based test could never have caught.
 */
const OUTPUT_BY_ACTION: Record<AdventureActionName, string> = {
  catchPokemon: 'catchPokemonEvent',
  battleTrainer: 'battleTrainerEvent',
  buyPotions: 'buyPotionsEvent',
  goStraight: 'doNothingEvent',
  catchTwoPokemon: 'catchTwoPokemonEvent',
  visitDaycare: 'visitDaycareEvent',
  teamRocket: 'teamRocketEncounterEvent',
  mysteriousEgg: 'mysteriousEggEvent',
  legendaryEncounter: 'legendaryEncounterEvent',
  tradePokemon: 'tradePokemonEvent',
  findItem: 'findItemEvent',
  exploreCave: 'exploreCaveEvent',
  snorlaxEncounter: 'snorlaxEncounterEvent',
  multitask: 'multitaskEvent',
  goFishing: 'goFishingEvent',
  findFossil: 'findFossilEvent',
  battleRival: 'battleRivalEvent',
  safariZone: 'safariZoneEvent',
  friendSafari: 'friendSafariEvent',
  areaZero: 'areaZeroEvent',
};

describe('MainAdventureRouletteComponent', () => {
  let component: MainAdventureRouletteComponent;
  let fixture: ComponentFixture<MainAdventureRouletteComponent>;
  let generationSubject: BehaviorSubject<GenerationItem>;

  const createGeneration = (id: number): GenerationItem => ({
    id,
    text: `Gen ${id}`,
    region: 'Test Region',
    fillStyle: 'black',
    weight: 1
  });

  beforeEach(async () => {
    generationSubject = new BehaviorSubject<GenerationItem>(createGeneration(1));

    await TestBed.configureTestingModule({
      imports: [MainAdventureRouletteComponent],
      providers: [
        provideTranslateService(),
        {
          provide: GenerationService,
          useValue: {
            getGeneration: () => generationSubject.asObservable(),
            getCurrentGeneration: () => createGeneration(1)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAdventureRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('region-only slices', () => {
    const namesFor = (generationId: number): string[] => {
      generationSubject.next(createGeneration(generationId));
      fixture.detectChanges();
      return component.actions.map(action => action.name);
    };

    it('offers Safari Zone in Kanto and Area Zero nowhere else', () => {
      const kanto = namesFor(1);

      expect(kanto).toContain('safariZone');
      expect(kanto).not.toContain('areaZero');
    });

    it('offers Area Zero in Paldea and Safari Zone nowhere else', () => {
      const paldea = namesFor(9);

      expect(paldea).toContain('areaZero');
      expect(paldea).not.toContain('safariZone');
    });

    it('offers Friend Safari in Kalos only', () => {
      const kalos = namesFor(6);

      expect(kalos).toContain('friendSafari');
      expect(kalos).not.toContain('safariZone');
      expect(kalos).not.toContain('areaZero');
      expect(namesFor(1)).not.toContain('friendSafari');
    });

    it('offers neither in a region that has no special slice', () => {
      const sinnoh = namesFor(4);

      expect(sinnoh).not.toContain('safariZone');
      expect(sinnoh).not.toContain('areaZero');
      expect(sinnoh).not.toContain('friendSafari');
      expect(sinnoh.length).toBe(ADVENTURE_ACTIONS.filter(a => !a.generations).length);
    });
  });

  describe('dispatch', () => {
    // The reason this component stopped dispatching on wheel index: with two region-only slices,
    // one index means different things in different regions. Every slice is checked in the region
    // it actually appears in.
    for (const action of ADVENTURE_ACTIONS) {
      it(`fires only ${action.name}`, () => {
        generationSubject.next(createGeneration(action.generations?.[0] ?? 4));
        fixture.detectChanges();

        const spies = new Map<AdventureActionName, jasmine.Spy>();
        for (const name of Object.keys(OUTPUT_BY_ACTION) as AdventureActionName[]) {
          const emitter = (component as unknown as Record<string, EventEmitter<unknown>>)[OUTPUT_BY_ACTION[name]];
          spies.set(name, spyOn(emitter, 'emit'));
        }

        const index = component.actions.findIndex(candidate => candidate.name === action.name);
        expect(index).withContext(`${action.name} is missing from its own region`).toBeGreaterThanOrEqual(0);

        component.onItemSelected(index);

        for (const [name, spy] of spies) {
          if (name === action.name) {
            expect(spy).withContext(`${name} should have fired`).toHaveBeenCalled();
          } else {
            expect(spy).withContext(`${name} fired for ${action.name}`).not.toHaveBeenCalled();
          }
        }
      });
    }
  });

});
