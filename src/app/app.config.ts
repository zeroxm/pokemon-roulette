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
      // v18 takes the paths through the loader's own provider. The old shape
      // (a bare { prefix, suffix } on TRANSLATE_HTTP_LOADER_CONFIG) is now read as
      // `resources: []`, which makes the loader issue zero requests and resolve to
      // an empty translation set - the app then renders raw keys with no error.
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};