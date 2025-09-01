import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MysteriousEggRouletteComponent } from './mysterious-egg-roulette.component';
import { HttpClient } from '@angular/common/http';

describe('MysteriousEggRouletteComponent', () => {
  let component: MysteriousEggRouletteComponent;
  let fixture: ComponentFixture<MysteriousEggRouletteComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [MysteriousEggRouletteComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MysteriousEggRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
