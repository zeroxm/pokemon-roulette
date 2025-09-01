import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteContainerComponent } from './roulette-container.component';

describe('RouletteContainerComponent', () => {
  let component: RouletteContainerComponent;
  let fixture: ComponentFixture<RouletteContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
