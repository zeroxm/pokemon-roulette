import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideHttpClient, HttpClient } from '@angular/common/http';

import {
  bootstrapArrowRepeat,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare
} from '@ng-icons/bootstrap-icons';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Fonction pour charger les fichiers JSON de traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIcons({
      bootstrapArrowRepeat,
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

    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
