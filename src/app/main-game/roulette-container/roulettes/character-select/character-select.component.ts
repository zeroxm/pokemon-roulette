import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../../../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../../../../services/theme-service/theme.service';
import { SettingsService } from '../../../../services/settings-service/settings.service';
import { GenerationItem } from '../../../../interfaces/generation-item';

@Component({
  selector: 'app-character-select',
  imports: [
    CommonModule,
    TranslatePipe
  ],
  templateUrl: './character-select.component.html',
  styleUrl: './character-select.component.css'
})
export class CharacterSelectComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService,
              private trainerService: TrainerService,
              private darkModeService: DarkModeService,
              private themeService: ThemeService,
              private settingsService: SettingsService
  ) { }

  private generationSubscription!: Subscription;
  boySprite: string = "";
  girlSprite: string = "";
  darkMode!: Observable<boolean>;
  generation!: GenerationItem;
  genderAutoSelected: boolean = false;
  @Output() trainerSelectedEvent = new EventEmitter<string>();

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      this.boySprite = this.trainerService.getTrainerSprite(this.generation.id, 'male');
      this.girlSprite = this.trainerService.getTrainerSprite(this.generation.id, 'female');
      
      // Auto-select gender if pre-configured
      const defaultGender = this.settingsService.currentSettings.defaultGender;
      if (defaultGender !== 'always-choose') {
        this.genderAutoSelected = true;
        // Defer event emission to next microtask to ensure parent is ready to listen
        queueMicrotask(() => this.selectTrainerGender(defaultGender));
      }
    });
    this.darkMode = this.themeService.isDark$;
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  selectTrainerGender(gender: string) {
    this.trainerService.setTrainer(this.generation.id, gender);
    this.trainerSelectedEvent.emit(gender);
  }
}
