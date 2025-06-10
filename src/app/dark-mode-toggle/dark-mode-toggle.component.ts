import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.css']
})
export class DarkModeToggleComponent {
  darkMode!: Observable<boolean>;

  constructor(private darkModeService: DarkModeService) {
    this.darkMode = this.darkModeService.darkMode$;
  }

  onToggle(): void {
    this.darkModeService.toggle();
  }
}
