import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeButtonComponent } from './coffee-button.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapCupHotFill } from '@ng-icons/bootstrap-icons';

describe('CoffeeButtonComponent', () => {
  let component: CoffeeButtonComponent;
  let fixture: ComponentFixture<CoffeeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CoffeeButtonComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapCupHotFill }),
      ],
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
