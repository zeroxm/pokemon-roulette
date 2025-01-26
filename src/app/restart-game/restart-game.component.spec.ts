import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartGameComponent } from './restart-game.component';

describe('RestartGameComponent', () => {
  let component: RestartGameComponent;
  let fixture: ComponentFixture<RestartGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestartGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestartGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
