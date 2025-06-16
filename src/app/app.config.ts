import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
<<<<<<< feature/translations
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { bootstrapArrowRepeat, bootstrapCheck, bootstrapClock, bootstrapController,
         bootstrapCupHotFill, bootstrapMap, bootstrapPcDisplayHorizontal, bootstrapPeopleFill, bootstrapShare } from '@ng-icons/bootstrap-icons';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) => new TranslateHttpLoader(http, '/i18n/', '.json');
=======
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


>>>>>>> main

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
<<<<<<< feature/translations
    provideIcons(
      { bootstrapArrowRepeat,
        bootstrapCheck,
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
=======
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
>>>>>>> main

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
