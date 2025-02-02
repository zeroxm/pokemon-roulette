import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WheelComponent } from '../../../wheel/wheel.component';
import { TrainerService } from '../../../services/trainer-service/trainer.service';
import { GenerationItem } from '../../../interfaces/generation-item';
import { GenerationService } from '../../../services/generation-service/generation.service';


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
              private generationService: GenerationService,
              private trainerService: TrainerService
  ) {
    this.generations = this.generationService.getGenerationList();
  }

  @ViewChild('trainerGenderModal', { static: true }) trainerGenderModal!: TemplateRef<any>;
  generations: GenerationItem[];
  selectedGeneration: GenerationItem | null = null;
  boySprite: string = "";
  girlSprite: string = "";
  @Output() generationSelectedEvent = new EventEmitter<GenerationItem>();
  @Output() trainerSelectedEvent = new EventEmitter<string>();



  onItemSelected(index: number): void {
    this.selectedGeneration = this.generations[index];
    this.generationService.setGeneration(index);
    this.boySprite = this.trainerService.getTrainerSprite(this.selectedGeneration.id, 'male');
    this.girlSprite = this.trainerService.getTrainerSprite(this.selectedGeneration.id, 'female');
    this.modalService.open(this.trainerGenderModal, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });
  }

  selectTrainerGender(gender: string): void {
    if(this.selectedGeneration) {
      this.trainerService.setTrainer(this.selectedGeneration.id, gender);
      this.modalService.dismissAll();
      this.trainerSelectedEvent.emit();
    }
  }
}

