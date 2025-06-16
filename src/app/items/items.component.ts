import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable, Subscription } from 'rxjs';
import { ItemItem } from '../interfaces/item-item';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TrainerService } from '../services/trainer-service/trainer.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-items',
  imports: [CommonModule,
    NgbTooltipModule, TranslatePipe],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent implements OnInit, OnDestroy {

  constructor(
    private darkModeService: DarkModeService,
    private trainerService: TrainerService,
    private translateService: TranslateService
  ) {
    this.darkMode = this.darkModeService.darkMode$;
  }

  trainerItems!: ItemItem[];
  @Output() rareCandyInterrupt = new EventEmitter<ItemItem>();

  darkMode!: Observable<boolean>;
  private itemsSubscription!: Subscription;

  ngOnInit(): void {
    this.itemsSubscription = this.trainerService.getItemsObservable().subscribe(items => {
      this.trainerItems = items;
    })
  }

  ngOnDestroy(): void {
    this.itemsSubscription?.unsubscribe();
  }

  useItem(item: ItemItem | undefined) {
    if(item) {
      if (item.name === 'rare-candy') {
        this.rareCandyInterrupt.emit(item);
      }
    }
  }

  getItemSprite(index: number): string {
    if (this.trainerItems[index]) {
      return this.trainerItems[index].sprite;
    }
    return './place-holder-pixel.png';
  }

  getItemText(index: number): string {
    if (this.trainerItems[index]) {
      return this.translateService.instant(this.trainerItems[index].text);
    }
    return 'Empty';
  }
}
