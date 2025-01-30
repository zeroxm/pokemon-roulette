import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MysteriousEggRouletteComponent } from './mysterious-egg-roulette.component';

describe('MysteriousEggRouletteComponent', () => {
  let component: MysteriousEggRouletteComponent;
  let fixture: ComponentFixture<MysteriousEggRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MysteriousEggRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MysteriousEggRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
