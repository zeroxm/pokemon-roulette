import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideHttpClient, withXhr } from '@angular/common/http';
import {
  bootstrapArrowRepeat,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
  bootstrapBook
} from '@ng-icons/bootstrap-icons';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIcons(
      { bootstrapArrowRepeat,
        bootstrapCheck,
        bootstrapClock,
        bootstrapController,
        bootstrapCupHotFill,
        bootstrapGear,
        bootstrapPcDisplayHorizontal,
        bootstrapPeopleFill,
        bootstrapShare,
        bootstrapMap,
        bootstrapBook
       }),
    provideHttpClient(withXhr()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTranslateService({
      // The paths must go through the loader's own provider. A bare { prefix, suffix } on
      // TRANSLATE_HTTP_LOADER_CONFIG parses as `resources: []`, and the loader then issues no
      // requests and resolves to an empty translation set — the app renders raw keys, silently.
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};