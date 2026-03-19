import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShinyRouletteComponent } from './shiny-roulette.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ShinyRouletteComponent', () => {
  let component: ShinyRouletteComponent;
  let fixture: ComponentFixture<ShinyRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShinyRouletteComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShinyRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
