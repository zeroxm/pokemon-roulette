import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
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
  bootstrapShare
} from '@ng-icons/bootstrap-icons';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

// note: TranslateHttpLoader pulls its configuration via the
// TRANSLATE_HTTP_LOADER_CONFIG injection token.  the factory below
// simply uses the default constructor; the token must be provided
// separately or Angular will complain (NG0201).  we could alternatively
// drop the factory entirely and use `provideTranslateHttpLoader` but
// the former keeps the original shape of the code.
const httpLoaderFactory = () => new TranslateHttpLoader();

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
        bootstrapMap
       }),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom([TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: []
      },
      defaultLanguage: 'en'
    })]),
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    }  ]
};