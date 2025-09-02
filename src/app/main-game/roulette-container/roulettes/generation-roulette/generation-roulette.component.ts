import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { DarkModeService } from '../../../../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';

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

  constructor(private generationService: GenerationService,
              private darkModeService: DarkModeService) {
    this.generations = this.generationService.getGenerationList();
    this.darkMode = this.darkModeService.darkMode$;
  }

  generations: GenerationItem[];
  darkMode!: Observable<boolean>;
  selectedGeneration: GenerationItem | null = null;
  showChoiceButtons = false;
  @Output() generationSelectedEvent = new EventEmitter<GenerationItem>();

  onItemSelected(index: number): void {
    this.selectedGeneration = this.generations[index];
    this.generationService.setGeneration(index);
    this.generationSelectedEvent.emit();
  }

  toggleChoiceView(): void {
    this.showChoiceButtons = !this.showChoiceButtons;
  }

  onGenerationChosen(index: number): void {
    this.selectedGeneration = this.generations[index];
    this.generationService.setGeneration(index);
    this.generationSelectedEvent.emit();
  }
}
