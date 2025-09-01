import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendaryRouletteComponent } from './legendary-roulette.component';

describe('LegendaryRouletteComponent', () => {
  let component: LegendaryRouletteComponent;
  let fixture: ComponentFixture<LegendaryRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendaryRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegendaryRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
