import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';

@Component({
  selector: 'app-generation-roulette',
  imports: [
    CommonModule,
    WheelComponent,
    TranslatePipe
  ],
  templateUrl: './generation-roulette.component.html',
  styleUrl: './generation-roulette.component.css'
})
export class GenerationRouletteComponent {

  constructor(private generationService: GenerationService) {
    this.generations = this.generationService.getGenerationList();
  }

  generations: GenerationItem[];
  selectedGeneration: GenerationItem | null = null;
  @Output() generationSelectedEvent = new EventEmitter<GenerationItem>();

  onItemSelected(index: number): void {
    this.selectedGeneration = this.generations[index];
    this.generationService.setGeneration(index);
    this.generationSelectedEvent.emit();
  }
}
