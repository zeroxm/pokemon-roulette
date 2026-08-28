import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ExploreCaveRouletteComponent } from './explore-cave-roulette.component';

describe('ExploreCaveRouletteComponent', () => {
  let component: ExploreCaveRouletteComponent;
  let fixture: ComponentFixture<ExploreCaveRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()],
      imports: [ExploreCaveRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreCaveRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
