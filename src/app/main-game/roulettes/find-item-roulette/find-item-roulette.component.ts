import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemsService } from '../../../services/items-service/items.service';
import { ItemSpriteService } from '../../../services/item-sprite-service/item-sprite.service';
import { ItemItem } from '../../../interfaces/item-item';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-find-item-roulette',
  imports: [
    CommonModule,
    WheelComponent],
  templateUrl: './find-item-roulette.component.html',
  styleUrl: './find-item-roulette.component.css'
})
export class FindItemRouletteComponent {

  constructor(private modalService: NgbModal,
    private itemService: ItemsService,
    private itemSpriteService: ItemSpriteService) {
      this.items = itemService.getAllItems();   
  }

  @ViewChild('itemExplainerModal', { static: true }) itemExplainerModal!: TemplateRef<any>;
  items: ItemItem[] = [];
  selectedItem: ItemItem | null = null;
  @Output() itemSelectedEvent = new EventEmitter<ItemItem>();

  onItemSelected(index: number): void {
    this.selectedItem = this.items[index];
    
    this.itemSpriteService.getItemSprite(this.selectedItem.name).pipe(take(1)).subscribe(response => {
      if (this.selectedItem) {
        this.selectedItem.sprite = response.sprite;
      }
    });
    
    const modalRef = this.modalService.open(this.itemExplainerModal, {
      centered: true,
      size: 'md',
      keyboard: false
    });

    modalRef.result.then(() => {
      if (this.selectedItem) {
        this.itemSelectedEvent.emit(this.selectedItem);
      }
    }, () => {
      if (this.selectedItem) {
        this.itemSelectedEvent.emit(this.selectedItem);
      }
    });
  }

  closeItemExplainerModal(): void {
    this.modalService.dismissAll();
  }
}
