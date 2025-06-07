import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { bootstrapArrowRepeat, bootstrapClock, bootstrapController,
         bootstrapCupHotFill, bootstrapMap, bootstrapPcDisplayHorizontal, bootstrapPeopleFill, bootstrapShare } from '@ng-icons/bootstrap-icons';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) => new TranslateHttpLoader(http, './i18n/', 'json');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIcons(
      { bootstrapArrowRepeat,
        bootstrapClock,
        bootstrapController,
        bootstrapCupHotFill,
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
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })])
  ]
};

