import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FossilRouletteComponent } from './fossil-roulette.component';

describe('FossilRouletteComponent', () => {
  let component: FossilRouletteComponent;
  let fixture: ComponentFixture<FossilRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FossilRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FossilRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
