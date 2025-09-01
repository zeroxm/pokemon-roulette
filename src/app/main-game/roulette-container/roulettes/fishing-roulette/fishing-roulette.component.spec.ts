import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FishingRouletteComponent } from './fishing-roulette.component';

describe('FishingRouletteComponent', () => {
  let component: FishingRouletteComponent;
  let fixture: ComponentFixture<FishingRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FishingRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FishingRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
