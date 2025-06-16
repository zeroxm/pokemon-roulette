import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< feature/translations
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
=======
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
>>>>>>> main
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokemon-roulette';

  constructor(private translate: TranslateService) {
<<<<<<< feature/translations
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.translate.addLangs(['en', 'fr', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLanguage);
=======
    translate.setDefaultLang('en');
    translate.use('en');
  }

  changeLang(lang: string) {
    this.translate.use(lang);
>>>>>>> main
  }
}
