import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PokemonSwitchModalComponent } from './pokemon-switch-modal.component';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

describe('PokemonSwitchModalComponent', () => {
  let fixture: ComponentFixture<PokemonSwitchModalComponent>;
  let component: PokemonSwitchModalComponent;

  const pokemon = (id: number, text: string): PokemonItem => ({
    pokemonId: id, text, fillStyle: 'red', weight: 1, shiny: false, power: 1,
    sprite: { front_default: `${id}.png`, front_shiny: `${id}s.png` }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonSwitchModalComponent, TranslateModule.forRoot()],
      providers: [NgbActiveModal]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonSwitchModalComponent);
    component = fixture.componentInstance;
    component.titleKey = 'title.key';
    component.from = pokemon(1, 'pokemon.from');
    component.to = pokemon(2, 'pokemon.to');
  });

  // This component merges the former evolve and trade templates. Only the two
  // connecting phrases differed, so both wordings are exercised here.

  it('renders the evolution wording, in order, between the two sprites', () => {
    component.leadKey = 'evolve.your';
    component.joinKey = 'evolve.into';
    fixture.detectChanges();

    const sentence = fixture.nativeElement.querySelector('.message p').textContent.trim();
    expect(sentence).toBe('evolve.your pokemon.from evolve.into pokemon.to!');

    const sprites = fixture.nativeElement.querySelectorAll('img');
    expect(sprites.length).toBe(2);
    expect(sprites[0].getAttribute('src')).toBe('1.png');
    expect(sprites[1].getAttribute('src')).toBe('2.png');
  });

  it('renders the trade wording with the same layout', () => {
    component.leadKey = 'trade.sent';
    component.joinKey = 'trade.received';
    fixture.detectChanges();

    const sentence = fixture.nativeElement.querySelector('.message p').textContent.trim();
    expect(sentence).toBe('trade.sent pokemon.from trade.received pokemon.to!');
  });
});
