import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WheelComponent } from '../../../wheel/wheel.component';
import { TrainerSpriteService } from '../../../services/trainer-sprite-service/trainer-sprite.service';
import { GenerationItem } from '../../../interfaces/generation-item';


@Component({
  selector: 'app-generation-roulette',
  imports: [
    CommonModule,
    WheelComponent
  ],
  templateUrl: './generation-roulette.component.html',
  styleUrl: './generation-roulette.component.css'
})
export class GenerationRouletteComponent {

  constructor(private modalService: NgbModal,
              private trainerSpriteService: TrainerSpriteService
  ) { }

  @ViewChild('trainerGenderModal', { static: true }) contentTemplate!: TemplateRef<any>;
  selectedItem: GenerationItem | null = null;
  boySprite: string = "";
  girlSprite: string = "";
  @Output () generationSelectedEvent = new EventEmitter<GenerationItem>();
  @Output () trainerGenderEvent = new EventEmitter<string>();

  generations: GenerationItem[] = [
    { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1 },
    { text: 'Gen 2', region: 'Johto', fillStyle: 'darkorange', id: 2 },
    { text: 'Gen 3', region: 'Hoenn', fillStyle: 'green', id: 3 },
    { text: 'Gen 4', region: 'Sinnoh', fillStyle: 'darkcyan', id: 4 },
    { text: 'Gen 5', region: 'Unova', fillStyle: 'darkblue', id: 5 },
    { text: 'Gen 6', region: 'Kalos', fillStyle: 'purple', id: 6 },
    { text: 'Gen 7', region: 'Alola', fillStyle: 'orchid', id: 7 },
    { text: 'Gen 8', region: 'Galar', fillStyle: 'black', id: 8 },
  ];

  onItemSelected(index: number): void {
    this.selectedItem = this.generations[index];
    this.generationSelectedEvent.emit(this.selectedItem);
    this.boySprite = this.trainerSpriteService.getTrainerSprite(this.selectedItem.id, 'male');
    this.girlSprite = this.trainerSpriteService.getTrainerSprite(this.selectedItem.id, 'female');
    this.modalService.open(this.contentTemplate, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });
  }

  selectTrainerGender(gender: string): void {
    if(this.selectedItem) {
      this.modalService.dismissAll();
      this.trainerGenderEvent.emit(this.trainerSpriteService.getTrainerSprite(this.selectedItem.id, gender));
    }
  }
}

