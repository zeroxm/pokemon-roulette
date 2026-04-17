import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { DarkModeService } from '../../../../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../../../../services/theme-service/theme.service';
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
              private darkModeService: DarkModeService,
              private themeService: ThemeService) {
    this.generations = this.generationService.getGenerationList();
    this.darkMode = this.themeService.isDark$;
  }

  generations: GenerationItem[];
  darkMode!: Observable<boolean>;
  selectedGeneration: GenerationItem | null = null;
  showChoiceButtons = true;
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
