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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
