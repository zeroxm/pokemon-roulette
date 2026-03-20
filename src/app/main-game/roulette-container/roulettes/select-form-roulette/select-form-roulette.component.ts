import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PokemonForm } from '../../../../interfaces/pokemon-form';
import { WheelComponent } from '../../../../wheel/wheel.component';

@Component({
  selector: 'app-select-form-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './select-form-roulette.component.html',
  styleUrl: './select-form-roulette.component.css'
})
export class SelectFormRouletteComponent {

  @Input() forms: PokemonForm[] = [];
  @Output() selectedFormEvent = new EventEmitter<PokemonForm>();

  onItemSelected(index: number): void {
    this.selectedFormEvent.emit(this.forms[index]);
  }
}
