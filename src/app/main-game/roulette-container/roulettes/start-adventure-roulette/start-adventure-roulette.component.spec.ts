import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAdventureRouletteComponent } from './start-adventure-roulette.component';
import { TranslateModule } from '@ngx-translate/core';

describe('StartAdventureRouletteComponent', () => {
  let component: StartAdventureRouletteComponent;
  let fixture: ComponentFixture<StartAdventureRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAdventureRouletteComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAdventureRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
