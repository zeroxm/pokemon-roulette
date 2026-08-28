import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ItemItem } from '../../../../interfaces/item-item';
import { WheelComponent } from '../../../../wheel/wheel.component';

@Component({
  selector: 'app-select-from-item-list-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './select-from-item-list-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './select-from-item-list-roulette.component.css'
})
export class SelectFromItemListRouletteComponent {
  @Input() wheelTitle = 'game.main.roulette.mega.whichStone';
  @Input() items: ItemItem[] = [];
  @Output() selectedItemEvent = new EventEmitter<ItemItem>();

  onItemSelected(index: number): void {
    this.selectedItemEvent.emit(this.items[index]);
  }
}
