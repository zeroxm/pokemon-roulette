import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSelectComponent } from './character-select.component';

describe('CharacterSelectComponent', () => {
  let component: CharacterSelectComponent;
  let fixture: ComponentFixture<CharacterSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
