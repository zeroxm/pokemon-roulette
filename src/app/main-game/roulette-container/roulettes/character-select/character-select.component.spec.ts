import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSelectComponent } from './character-select.component';
import { HttpClient } from '@angular/common/http';

describe('CharacterSelectComponent', () => {
  let component: CharacterSelectComponent;
  let fixture: ComponentFixture<CharacterSelectComponent>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [CharacterSelectComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
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
