import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterRouletteComponent } from './starter-roulette.component';
import { GenerationItem } from '../../../interfaces/generation-item';

describe('StarterRouletteComponent', () => {
  let component: StarterRouletteComponent;
  let fixture: ComponentFixture<StarterRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarterRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarterRouletteComponent);
    component = fixture.componentInstance;
    component.generation = { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1, weight: 1 } as GenerationItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
