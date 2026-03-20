import {Component, inject} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../interfaces/language';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapCheck } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
  imports: [
    NgbDropdownModule,
    NgIcon
  ],
  providers: [
    provideIcons({ bootstrapCheck })
  ],
  standalone: true
})
export class LanguageSelectorComponent {
  private translateService = inject(TranslateService);

  languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  currentLanguage: Language = this.languages[0];

  constructor() {
    const currentLanguage = this.translateService.currentLang || this.translateService.getDefaultLang() || 'en';
    this.updateCurrentLanguage(currentLanguage)
    this.translateService.onLangChange.subscribe(event => {
      this.updateCurrentLanguage(event.lang);
    });
  }

  changeLanguage(languageCode: string): void {
    this.translateService.use(languageCode);
    this.updateCurrentLanguage(languageCode);
    localStorage.setItem('language', languageCode);
  }

  private updateCurrentLanguage(languageCode: string): void {
    const language = this.languages.find(lang => lang.code === languageCode);
    if (language) {
      this.currentLanguage = language;
    }
  }
}
