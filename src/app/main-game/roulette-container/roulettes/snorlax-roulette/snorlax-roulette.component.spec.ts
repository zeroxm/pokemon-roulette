import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnorlaxRouletteComponent } from './snorlax-roulette.component';

describe('SnorlaxRouletteComponent', () => {
  let component: SnorlaxRouletteComponent;
  let fixture: ComponentFixture<SnorlaxRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnorlaxRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnorlaxRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
