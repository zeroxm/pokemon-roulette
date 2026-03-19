import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatchLegendaryRouletteComponent } from './catch-legendary-roulette.component';
import { TranslateModule } from '@ngx-translate/core';

describe('CatchLegendaryRouletteComponent', () => {
  let component: CatchLegendaryRouletteComponent;
  let fixture: ComponentFixture<CatchLegendaryRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatchLegendaryRouletteComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatchLegendaryRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
