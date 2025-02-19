import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsButtonComponent } from './credits-button.component';

describe('CreditsButtonComponent', () => {
  let component: CreditsButtonComponent;
  let fixture: ComponentFixture<CreditsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
