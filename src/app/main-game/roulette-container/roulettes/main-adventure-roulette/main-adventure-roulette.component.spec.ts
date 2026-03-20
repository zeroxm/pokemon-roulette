import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { GenerationService } from '../../../../services/generation-service/generation.service';

import { MainAdventureRouletteComponent } from './main-adventure-roulette.component';

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
      imports: [MainAdventureRouletteComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: GenerationService,
          useValue: {
            getGeneration: () => generationSubject.asObservable()
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

  it('should keep the base action list for non-gen-9 generations', () => {
    expect(component.actions.length).toBe(17);
    expect(component.actions.some(action => action.text === 'game.main.roulette.adventure.actions.areaZero')).toBeFalse();
  });

  it('should append the Area Zero action for generation 9', () => {
    generationSubject.next(createGeneration(9));
    fixture.detectChanges();

    expect(component.actions.length).toBe(18);
    expect(component.actions[17].text).toBe('game.main.roulette.adventure.actions.areaZero');
  });

  it('should emit the Area Zero event from the gen-9-only slot', () => {
    spyOn(component.areaZeroEvent, 'emit');

    component.onItemSelected(17);

    expect(component.areaZeroEvent.emit).toHaveBeenCalled();
  });
});
