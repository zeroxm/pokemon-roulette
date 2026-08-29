import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionBattleRouletteComponent } from './champion-battle-roulette.component';
import { provideTranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

describe('ChampionBattleRouletteComponent', () => {
  let component: ChampionBattleRouletteComponent;
  let fixture: ComponentFixture<ChampionBattleRouletteComponent>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [ChampionBattleRouletteComponent],
      providers: [
        provideTranslateService(),
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChampionBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
