import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteFourPrepRouletteComponent } from './elite-four-prep-roulette.component';

describe('EliteFourPrepRouletteComponent', () => {
  let component: EliteFourPrepRouletteComponent;
  let fixture: ComponentFixture<EliteFourPrepRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliteFourPrepRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteFourPrepRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
