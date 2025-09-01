import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShinyRouletteComponent } from './shiny-roulette.component';

describe('ShinyRouletteComponent', () => {
  let component: ShinyRouletteComponent;
  let fixture: ComponentFixture<ShinyRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShinyRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShinyRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
