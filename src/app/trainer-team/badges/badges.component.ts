import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Badge } from '../../interfaces/badge';
import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme-service/theme.service';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-badges',
  imports: [
    ImageFallbackDirective,
    CommonModule,
    NgbTooltipModule,
    TranslatePipe
  ],
  templateUrl: './badges.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './badges.component.css'
})
export class BadgesComponent {

    @Input() trainerBadges!: Badge[];

    darkMode!: Observable<boolean>;

    constructor(private themeService: ThemeService) {
      this.darkMode = this.themeService.isDark$;
    }
}
