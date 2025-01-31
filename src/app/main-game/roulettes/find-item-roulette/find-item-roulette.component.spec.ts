import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindItemRouletteComponent } from './find-item-roulette.component';

describe('FindItemRouletteComponent', () => {
  let component: FindItemRouletteComponent;
  let fixture: ComponentFixture<FindItemRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindItemRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindItemRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
