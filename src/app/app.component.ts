import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokemon-roulette';

  constructor(private translate: TranslateService) {
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.translate.addLangs(['en', 'fr', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLanguage);
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
