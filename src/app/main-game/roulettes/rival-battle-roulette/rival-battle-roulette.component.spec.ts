import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RivalBattleRouletteComponent } from './rival-battle-roulette.component';
import { HttpClient } from '@angular/common/http';

describe('RivalBattleRouletteComponent', () => {
  let component: RivalBattleRouletteComponent;
  let fixture: ComponentFixture<RivalBattleRouletteComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [RivalBattleRouletteComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RivalBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
