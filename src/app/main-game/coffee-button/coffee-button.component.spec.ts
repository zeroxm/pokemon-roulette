import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeButtonComponent } from './coffee-button.component';

describe('CoffeeButtonComponent', () => {
  let component: CoffeeButtonComponent;
  let fixture: ComponentFixture<CoffeeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoffeeButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoffeeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
