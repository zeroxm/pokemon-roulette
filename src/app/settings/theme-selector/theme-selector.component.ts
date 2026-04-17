import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService, Theme } from '../../services/theme-service/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.css'
})
export class ThemeSelectorComponent {
  constructor(private themeService: ThemeService) {}

  get currentTheme(): Theme {
    return this.themeService.currentTheme;
  }

  onThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.themeService.setTheme(select.value as Theme);
  }
}
