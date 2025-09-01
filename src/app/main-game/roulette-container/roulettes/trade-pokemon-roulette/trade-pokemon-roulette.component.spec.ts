import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradePokemonRouletteComponent } from './trade-pokemon-roulette.component';
import { HttpClient } from '@angular/common/http';

describe('TradePokemonRouletteComponent', () => {
  let component: TradePokemonRouletteComponent;
  let fixture: ComponentFixture<TradePokemonRouletteComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [TradePokemonRouletteComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradePokemonRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
