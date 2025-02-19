import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGameButtonComponent } from './main-game-button.component';

describe('MainGameButtonComponent', () => {
  let component: MainGameButtonComponent;
  let fixture: ComponentFixture<MainGameButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainGameButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainGameButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
