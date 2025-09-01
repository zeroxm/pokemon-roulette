import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationRouletteComponent } from './generation-roulette.component';
import { HttpClient } from '@angular/common/http';

describe('GenerationRouletteComponent', () => {
  let component: GenerationRouletteComponent;
  let fixture: ComponentFixture<GenerationRouletteComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [GenerationRouletteComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
