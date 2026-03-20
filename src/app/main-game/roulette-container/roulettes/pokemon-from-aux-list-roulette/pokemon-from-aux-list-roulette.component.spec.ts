import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PokemonFromAuxListRouletteComponent } from './pokemon-from-aux-list-roulette.component';


describe('PokemonFromAuxListRouletteComponent', () => {
  let component: PokemonFromAuxListRouletteComponent;
  let fixture: ComponentFixture<PokemonFromAuxListRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonFromAuxListRouletteComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFromAuxListRouletteComponent);
    component = fixture.componentInstance;
    component.trainerTeam = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
