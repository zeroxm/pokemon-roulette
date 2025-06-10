import { Component, Input } from '@angular/core';
import { Badge } from '../../interfaces/badge';
import { Observable } from 'rxjs';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-badges',
  imports: [
    CommonModule,
    NgbTooltipModule,
    TranslatePipe
  ],
  templateUrl: './badges.component.html',
  styleUrl: './badges.component.css'
})
export class BadgesComponent {

    @Input() trainerBadges!: Badge[];

    darkMode!: Observable<boolean>;

    constructor(private darkModeService: DarkModeService) {
      this.darkMode = this.darkModeService.darkMode$;
    }
}
