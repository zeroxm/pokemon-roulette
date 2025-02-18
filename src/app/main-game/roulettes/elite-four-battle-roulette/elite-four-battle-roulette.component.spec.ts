import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteFourBattleRouletteComponent } from './elite-four-battle-roulette.component';
import { HttpClient } from '@angular/common/http';

describe('EliteFourBattleRouletteComponent', () => {
  let component: EliteFourBattleRouletteComponent;
  let fixture: ComponentFixture<EliteFourBattleRouletteComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [EliteFourBattleRouletteComponent],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteFourBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
