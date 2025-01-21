import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAdventureRouletteComponent } from './start-adventure-roulette.component';

describe('StartAdventureRouletteComponent', () => {
  let component: StartAdventureRouletteComponent;
  let fixture: ComponentFixture<StartAdventureRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAdventureRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAdventureRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
