import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapArrowRepeat, bootstrapClock, bootstrapController,
         bootstrapCupHotFill, bootstrapMap, bootstrapPcDisplayHorizontal, bootstrapPeopleFill, bootstrapShare } from '@ng-icons/bootstrap-icons';

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
    provideZoneChangeDetection({ eventCoalescing: true })]
};

