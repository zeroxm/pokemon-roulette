import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { CheckEvolutionRouletteComponent } from './check-evolution-roulette.component';

describe('CheckEvolutionRouletteComponent', () => {
  let component: CheckEvolutionRouletteComponent;
  let fixture: ComponentFixture<CheckEvolutionRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()],
      imports: [CheckEvolutionRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckEvolutionRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
