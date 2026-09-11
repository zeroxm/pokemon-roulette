import { Component, Inject, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { ThemeService } from './services/theme-service/theme.service';
import { AuthService } from './services/auth-service/auth.service';
import { SyncService } from './services/sync-service/sync.service';
import { AchievementToastComponent } from './achievements/achievement-toast/achievement-toast.component';
import { HANDOFF_RESULT } from './migration/handoff-result';
import { ImportResult } from './migration/import-handoff';

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;
const DEFAULT_LANGUAGE = 'en';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AchievementToastComponent, TranslatePipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'pokemon-roulette';

  /** Set only when a player has just arrived from the old address. */
  transferred: ImportResult | null;

  constructor(
    private translate: TranslateService,
    private renderer: Renderer2,
    // Eagerly instantiate ThemeService so the stored theme is applied on startup,
    // before any settings panel is opened.
    _theme: ThemeService,
    authService: AuthService,
    syncService: SyncService,
    @Inject(HANDOFF_RESULT) handoff: ImportResult | null,
  ) {
    this.transferred = handoff;

    // The stored value is interpolated into the loader's fetch URL
    // (./assets/i18n/${lang}.json), so it must be checked against the supported
    // set rather than trusted: a crafted value would redirect that request.
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);

    const stored = localStorage.getItem('language');
    const savedLanguage = stored !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
      ? stored
      : DEFAULT_LANGUAGE;
    this.translate.use(savedLanguage);

    // One request on startup to find out whether there is an account, then the
    // sync client picks it up. A signed-out player never causes another.
    syncService.start();
    authService.refresh().subscribe();

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
