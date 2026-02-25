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