import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationRouletteComponent } from './generation-roulette.component';

describe('GenerationRouletteComponent', () => {
  let component: GenerationRouletteComponent;
  let fixture: ComponentFixture<GenerationRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
