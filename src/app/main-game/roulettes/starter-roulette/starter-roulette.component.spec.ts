import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterRouletteComponent } from './starter-roulette.component';

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
    component.generation = { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
