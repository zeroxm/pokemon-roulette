import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGameComponent } from './main-game.component';

describe('MainGameComponent', () => {
  let component: MainGameComponent;
  let fixture: ComponentFixture<MainGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
