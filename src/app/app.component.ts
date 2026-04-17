import { Component, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { ThemeService } from './services/theme-service/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokemon-roulette';

  constructor(
    private translate: TranslateService,
    private renderer: Renderer2,
    // Eagerly instantiate ThemeService so the stored theme is applied on startup,
    // before any settings panel is opened.
    _theme: ThemeService,
  ) {
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.translate.addLangs(['en', 'es', 'fr', 'de', 'it', 'pt']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLanguage);

    if (environment.production && environment.googleAnalyticsId) {
      this.loadGoogleAnalytics(environment.googleAnalyticsId);
    }
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  private loadGoogleAnalytics(measurementId: string): void {
    const script = this.renderer.createElement('script') as HTMLScriptElement;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.renderer.appendChild(document.head, script);

    const inlineScript = this.renderer.createElement('script') as HTMLScriptElement;
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    this.renderer.appendChild(document.head, inlineScript);
  }
}
